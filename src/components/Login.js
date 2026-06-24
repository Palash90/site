import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Container, Card, Button, Form, Alert, Spinner } from "react-bootstrap";
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

export default function Login() {
  const { signInWithGoogle, signUpWithEmail, signInWithEmail } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const handleSocialLogin = (fn) => async () => {
    try {
      setError("");
      setLoading(true);
      await fn();
      navigate("/contents/music#your-scores");
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
        await signUpWithEmail(email, password);
        setVerificationSent(true);
      } else {
        await signInWithEmail(email, password);
        navigate("/contents/music#your-scores");
      }
    } catch (e) {
      setError(friendlyError(e.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center mt-5">
      <Card bg="dark" text="light" style={{ width: "400px" }}>
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
            <Form.Group className="mb-2">
              <Form.Control
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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
              />
            </Form.Group>
            <Button type="submit" variant="primary" className="w-100" disabled={loading}>
              {loading ? <Spinner size="sm" /> : isSignUp ? "Sign Up with Email" : "Sign In with Email"}
            </Button>
          </Form>

          <div className="text-center mt-2">
            <Button variant="link" size="sm" onClick={() => { setIsSignUp(!isSignUp); setError(""); setVerificationSent(false); }}>
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
