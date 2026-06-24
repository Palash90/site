import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Container, Card, Button, Form, Alert, Spinner, InputGroup } from "react-bootstrap";
import { FcGoogle } from "react-icons/fc";
import { FaEnvelope } from "react-icons/fa";

const friendlyError = (code) => {
  const map = {
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password. Try again.",
    "auth/invalid-credential": "Invalid email or password.",
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
    "auth/popup-closed-by-user": "Sign-in popup was closed before completing.",
    "auth/popup-blocked": "Popup was blocked by your browser. Allow popups for this site.",
    "auth/cancelled-popup-request": "Sign-in cancelled.",
    "auth/account-exists-with-different-credential": "An account already exists with this email using a different sign-in method.",
    "auth/requires-recent-login": "Please log out and log back in to perform this action.",
    "auth/network-request-failed": "Network error. Check your internet connection.",
    "auth/operation-not-allowed": "This sign-in method is not enabled. Contact the site owner.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/unauthorized-domain": "This domain is not authorized for sign-in.",
  };
  const key = code?.startsWith("auth/") ? code : `auth/${code}`;
  const msg = map[key] || map[code];
  return msg || `Something went wrong (${code}). Please try again.`;
};

const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;

async function checkUsernameAvailable(username) {
  if (!username || username.length < 3) return null;
  const snap = await getDoc(doc(db, "usernames", username.toLowerCase()));
  return !snap.exists();
}

export default function Login() {
  const { signInWithGoogle, signUpWithEmail, signInWithEmail, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [usernameAvail, setUsernameAvail] = useState(null);
  const [checkingUser, setCheckingUser] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const checkAvail = useCallback(async (val) => {
    if (!val || val.length < 3) { setUsernameAvail(null); return; }
    setCheckingUser(true);
    setUsernameAvail(await checkUsernameAvailable(val));
    setCheckingUser(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => checkAvail(username), 400);
    return () => clearTimeout(t);
  }, [username, checkAvail]);

  const usernameErr = () => {
    if (!username || !isSignUp) return "";
    if (username.length < 3) return "At least 3 characters.";
    if (username.length > 20) return "At most 20 characters.";
    if (!USERNAME_REGEX.test(username)) return "Letters, numbers, underscores, hyphens only.";
    if (usernameAvail === false) return "Username taken.";
    return "";
  };

  const redirectAfterLogin = async (uid) => {
    for (let i = 0; i < 10; i++) {
      const snap = await getDoc(doc(db, "profiles", uid));
      if (snap.exists()) {
        if (!snap.data()?.username) {
          navigate("/setup-username");
        } else {
          navigate("/contents/scores");
        }
        return;
      }
      await new Promise(r => setTimeout(r, 300));
    }
    navigate("/");
  };

  const handleSocialLogin = (fn) => async () => {
    try {
      setError("");
      setLoading(true);
      const cred = await fn();
      await redirectAfterLogin(cred.user.uid);
    } catch (e) {
      console.log("Auth error:", e.code, e.message);
      setError(friendlyError(e.code));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError("");
    setVerificationSent(false);
    setLoading(true);
    try {
      if (isSignUp) {
        const uErr = usernameErr();
        if (uErr || usernameAvail !== true) {
          throw new Error(uErr || "Choose a different username.");
        }
        const cred = await signUpWithEmail(email, password);
        await setDoc(doc(db, "usernames", username.toLowerCase()), { uid: cred.user.uid });
        await setDoc(doc(db, "profiles", cred.user.uid), { username: username.toLowerCase() }, { merge: true });
        await refreshProfile();
        setVerificationSent(true);
      } else {
        const cred = await signInWithEmail(email, password);
        await redirectAfterLogin(cred.user.uid);
      }
    } catch (e) {
      setError(friendlyError(e.code) || e.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError("");
    setVerificationSent(false);
    setUsernameAvail(null);
  };

  return (
    <Container className="d-flex justify-content-center mt-5">
      <Card bg="dark" text="light" style={{ width: "420px" }}>
        <Card.Body>
          <Card.Title className="text-center mb-4">
            <FaEnvelope className="me-2" />{isSignUp ? "Sign Up" : "Sign In"}
          </Card.Title>

          {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
          {verificationSent && (
            <Alert variant="info" className="py-2 small">
              Verification email sent. Please check your inbox before signing in.
            </Alert>
          )}

          <Form onSubmit={handleEmailAuth}>
            {isSignUp && (
              <Form.Group className="mb-2">
                <InputGroup>
                  <InputGroup.Text className="bg-black text-secondary border-secondary">@</InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setUsernameAvail(null); }}
                    required
                    className="bg-dark text-light border-secondary"
                    autoComplete="off"
                    spellCheck={false}
                  />
                </InputGroup>
                {username.length >= 3 && (
                  <Form.Text className={usernameAvail === true ? "text-success" : usernameAvail === false ? "text-danger" : "text-secondary"}>
                    {checkingUser ? <Spinner animation="border" size="sm" /> :
                      usernameAvail === true ? "✓ Available" :
                      usernameAvail === false ? "✗ Taken" : ""}
                  </Form.Text>
                )}
                {usernameErr() && usernameAvail !== false && <Form.Text className="text-danger d-block">{usernameErr()}</Form.Text>}
              </Form.Group>
            )}
            <Form.Group className="mb-2">
              <Form.Control
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-dark text-light border-secondary"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="bg-dark text-light border-secondary"
              />
            </Form.Group>
            <Button type="submit" variant="primary" className="w-100" disabled={loading}>
              {loading ? <Spinner size="sm" /> : isSignUp ? "Sign Up with Email" : "Sign In with Email"}
            </Button>
          </Form>

          <div className="text-center mt-2">
            <Button variant="link" size="sm" onClick={toggleMode}>
              {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
            </Button>
          </div>

          <hr className="text-secondary" />
          <div className="d-grid gap-2">
            <Button variant="outline-light" onClick={handleSocialLogin(signInWithGoogle)} disabled={loading}>
              <FcGoogle className="me-2" />Sign in with Google
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}
