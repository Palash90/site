import React, { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { Row, Col, Button, Form, Alert, Spinner } from "react-bootstrap";
import { FaUserCircle, FaGoogle } from "react-icons/fa";

export default function Comments({ contentId }) {
  const { user, signInWithGoogle } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const loadComments = useCallback(async () => {
    if (!contentId) return;
    try {
      const q = query(
        collection(db, "comments"),
        where("contentId", "==", contentId),
        orderBy("createdAt", "asc")
      );
      const snap = await getDocs(q);
      setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error("Failed to load comments", e);
    } finally {
      setLoading(false);
    }
  }, [contentId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    setError("");
    try {
      await addDoc(collection(db, "comments"), {
        contentId,
        userId: user.uid,
        userName: user.displayName || user.email?.split("@")[0] || "Anonymous",
        userPhoto: user.photoURL || null,
        text: text.trim(),
        createdAt: serverTimestamp(),
      });
      setText("");
      await loadComments();
    } catch (e) {
      console.error("Failed to post comment", e.code, e.message);
      setError("Failed to post comment.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mt-5" style={{ borderTop: "1px solid #333", paddingTop: "2rem" }}>
      <h5 className="mb-4">Comments</h5>

      {loading ? (
        <div className="text-center py-4"><Spinner animation="border" variant="light" size="sm" /></div>
      ) : comments.length === 0 ? (
        <p className="text-secondary small mb-4">No comments yet.</p>
      ) : (
        <div className="mb-4">
          {comments.map((c) => (
            <div key={c.id} className="d-flex gap-3 mb-3 p-3 rounded" style={{ background: "#1e1e1e" }}>
              {c.userPhoto ? (
                <img src={c.userPhoto} alt="" width="36" height="36" className="rounded-circle" />
              ) : (
                <FaUserCircle size={36} className="text-secondary flex-shrink-0" />
              )}
              <div>
                <div className="d-flex gap-2 align-items-baseline">
                  <strong className="small">{c.userName}</strong>
                  <span className="text-secondary" style={{ fontSize: "11px" }}>
                    {c.createdAt?.toDate?.()?.toLocaleDateString() || ""}
                  </span>
                </div>
                <p className="mb-0 small mt-1" style={{ whiteSpace: "pre-wrap" }}>{c.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {user ? (
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-2">
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Write a comment..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="bg-dark text-light border-secondary"
              required
            />
          </Form.Group>
          {error && <Alert variant="danger" className="py-1 small">{error}</Alert>}
          <Button type="submit" disabled={sending || !text.trim()}>
            {sending ? "Posting..." : "Post Comment"}
          </Button>
        </Form>
      ) : (
        <div className="d-flex align-items-center gap-2 text-secondary small">
          <FaGoogle /> <Button variant="link" size="sm" onClick={signInWithGoogle} className="p-0">Sign in with Google</Button> to leave a comment.
        </div>
      )}
    </div>
  );
}
