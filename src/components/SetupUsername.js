import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { Container, Card, Form, Button, Alert, Spinner, InputGroup } from "react-bootstrap";
import { col } from "../utils/firestorePath";

const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;
const USERNAME_MIN = 3;
const USERNAME_MAX = 20;

export default function SetupUsername() {
  const { user, needsUsername, setNeedsUsername, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const checkAvailability = useCallback(async (val) => {
    if (!val || val.length < USERNAME_MIN) {
      setAvailable(null);
      return;
    }
    setChecking(true);
    try {
      const snap = await getDoc(doc(db, col("usernames"), val.toLowerCase()));
      setAvailable(!snap.exists());
    } catch {
      setAvailable(null);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => checkAvailability(username), 400);
    return () => clearTimeout(t);
  }, [username, checkAvailability]);

  const validationError = () => {
    if (!username) return "";
    if (username.length < USERNAME_MIN) return `At least ${USERNAME_MIN} characters.`;
    if (username.length > USERNAME_MAX) return `At most ${USERNAME_MAX} characters.`;
    if (!USERNAME_REGEX.test(username)) return "Letters, numbers, underscores, hyphens only.";
    if (available === false) return "Username taken.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validationError();
    if (err || !available) { setError(err || "Choose a different username."); return; }
    setError("");
    setSaving(true);
    try {
      const targetUsername = username.toLowerCase();
      const usernameRef = doc(db, col("usernames"), targetUsername);
      const existing = await getDoc(usernameRef);

      if (existing.exists()) {
        // Already claimed (e.g. reserved during email sign-up) — verify it's ours
        if (existing.data().uid !== user.uid) {
          throw new Error("Username taken.");
        }
      } else {
        await setDoc(usernameRef, { uid: user.uid });
      }

      await updateDoc(doc(db, col("profiles"), user.uid), { username: targetUsername });

      await refreshProfile();
      setNeedsUsername(false);
      navigate("/contents/scores");
    } catch (err) {
      if (err.code === "already-exists" || err.code === "permission-denied") {
        setError("That username was just taken. Try another.");
      } else {
        setError(err.message);
      }
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (user && !needsUsername) {
      navigate("/", { replace: true });
    }
  }, [user, needsUsername, navigate]);

  if (!user) return null;

  const errMsg = validationError();
  const canSubmit = username.length >= USERNAME_MIN && available === true && !errMsg;

  return (
    <Container className="d-flex justify-content-center mt-5">
      <Card bg="dark" text="light" style={{ width: "450px" }}>
        <Card.Body>
          <Card.Title className="text-center mb-1">Welcome!</Card.Title>
          <Card.Subtitle className="text-center text-secondary mb-4 small">
            {user.email} — Choose a username to get started.
          </Card.Subtitle>

          {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="small text-secondary">Username</Form.Label>
              <InputGroup>
                <InputGroup.Text className="bg-black text-secondary border-secondary">@</InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="your_username"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setAvailable(null); setError(""); }}
                  className="bg-dark text-light border-secondary"
                  autoFocus
                  autoComplete="off"
                  spellCheck={false}
                />
              </InputGroup>
              {username.length >= USERNAME_MIN && (
                <Form.Text className={available === true ? "text-success" : available === false ? "text-danger" : "text-secondary"}>
                  {checking ? <Spinner animation="border" size="sm" /> :
                    available === true ? "✓ Available" :
                    available === false ? "✗ Taken" : ""}
                </Form.Text>
              )}
              {errMsg && !available === false && <Form.Text className="text-danger d-block">{errMsg}</Form.Text>}
            </Form.Group>

            <Button type="submit" variant="primary" className="w-100" disabled={!canSubmit || saving}>
              {saving ? <Spinner size="sm" /> : "Set Username"}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
