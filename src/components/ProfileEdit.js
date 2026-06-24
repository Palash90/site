import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { Container, Form, Button, Alert, Spinner, Row, Col } from "react-bootstrap";

export default function ProfileEdit() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [website, setWebsite] = useState("");
  const [birthday, setBirthday] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!user) return;
    const snap = await getDoc(doc(db, "profiles", user.uid));
    if (snap.exists()) {
      const d = snap.data();
      setDisplayName(d.displayName || "");
      setWebsite(d.website || "");
      setBirthday(d.birthday || "");
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);
    try {
      await updateDoc(doc(db, "profiles", user.uid), {
        displayName: displayName.trim() || user.email?.split("@")[0] || "Anonymous",
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
