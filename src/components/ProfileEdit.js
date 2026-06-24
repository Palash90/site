import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { Container, Form, Button, Alert, Spinner, Row, Col, InputGroup } from "react-bootstrap";

const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;

export default function ProfileEdit() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [originalUsername, setOriginalUsername] = useState("");
  const [usernameAvail, setUsernameAvail] = useState(null);
  const [checkingUser, setCheckingUser] = useState(false);
  const [website, setWebsite] = useState("");
  const [birthday, setBirthday] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const checkAvail = useCallback(async (val) => {
    if (!val || val.length < 3 || val.toLowerCase() === originalUsername) {
      setUsernameAvail(null);
      return;
    }
    setCheckingUser(true);
    const snap = await getDoc(doc(db, "usernames", val.toLowerCase()));
    setUsernameAvail(!snap.exists());
    setCheckingUser(false);
  }, [originalUsername]);

  useEffect(() => {
    const t = setTimeout(() => checkAvail(username), 400);
    return () => clearTimeout(t);
  }, [username, checkAvail]);

  const loadProfile = useCallback(async () => {
    if (!user) return;
    const snap = await getDoc(doc(db, "profiles", user.uid));
    if (snap.exists()) {
      const d = snap.data();
      setDisplayName(d.displayName || "");
      setUsername(d.username || "");
      setOriginalUsername(d.username || "");
      setWebsite(d.website || "");
      setBirthday(d.birthday || "");
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const usernameErr = () => {
    if (!username) return "";
    if (username.length < 3) return "At least 3 characters.";
    if (username.length > 20) return "At most 20 characters.";
    if (!USERNAME_REGEX.test(username)) return "Letters, numbers, underscores, hyphens only.";
    if (usernameAvail === false) return "Username taken.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaved(false);
    const uErr = usernameErr();
    if (uErr) { setError(uErr); return; }
    setSaving(true);
    try {
      const newUsername = username.toLowerCase().trim();
      const oldUsername = originalUsername.toLowerCase().trim();
      if (newUsername && newUsername !== oldUsername) {
        if (usernameAvail !== true) {
          throw new Error("Username is not available.");
        }
        await setDoc(doc(db, "usernames", newUsername), { uid: user.uid });
        if (oldUsername) {
          await deleteDoc(doc(db, "usernames", oldUsername));
        }
      }
      await updateDoc(doc(db, "profiles", user.uid), {
        displayName: displayName.trim() || user.email?.split("@")[0] || "Anonymous",
        username: newUsername,
        website: website.trim(),
        birthday,
      });
      setSaved(true);
      setTimeout(() => navigate(-1), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="light" /></div>;

  return (
    <Container className="py-4" style={{ maxWidth: 500 }}>
      <h4 className="mb-4">Edit Profile</h4>
      {error && <Alert variant="danger">{error}</Alert>}
      {saved && <Alert variant="success">Profile saved!</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label className="text-secondary small">Display Name</Form.Label>
          <Form.Control type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} className="bg-dark text-light border-secondary" />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label className="text-secondary small">Username</Form.Label>
          <InputGroup>
            <InputGroup.Text className="bg-black text-secondary border-secondary">@</InputGroup.Text>
            <Form.Control
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setUsernameAvail(null); }}
              className="bg-dark text-light border-secondary"
              autoComplete="off"
              spellCheck={false}
            />
          </InputGroup>
          {username.length >= 3 && username.toLowerCase() !== originalUsername && (
            <Form.Text className={usernameAvail === true ? "text-success" : usernameAvail === false ? "text-danger" : "text-secondary"}>
              {checkingUser ? <Spinner animation="border" size="sm" /> :
                usernameAvail === true ? "✓ Available" :
                usernameAvail === false ? "✗ Taken" : ""}
            </Form.Text>
          )}
          {usernameErr() && usernameAvail !== false && <Form.Text className="text-danger d-block">{usernameErr()}</Form.Text>}
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label className="text-secondary small">Website</Form.Label>
          <Form.Control type="url" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://" className="bg-dark text-light border-secondary" />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label className="text-secondary small">Birthday</Form.Label>
          <Form.Control type="date" value={birthday} onChange={e => setBirthday(e.target.value)} className="bg-dark text-light border-secondary" />
        </Form.Group>
        <Row>
          <Col>
            <Button variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
          </Col>
          <Col className="text-end">
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          </Col>
        </Row>
      </Form>
    </Container>
  );
}
