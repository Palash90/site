import React, { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { Row, Col, Button, Form, Alert, Spinner } from "react-bootstrap";
import { FaUserCircle, FaGoogle, FaThumbsUp, FaTrash, FaCheck, FaBan } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import gravatarUrl from "../utils/gravatar";

export default function Comments({ contentId }) {
  const { user, profile, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const isModerator = profile?.role === "moderator";

  const loadComments = useCallback(async () => {
    if (!contentId) return;
    try {
      const q = query(
        collection(db, "comments"),
        where("contentId", "==", contentId),
        orderBy("createdAt", "asc")
      );
      const snap = await getDocs(q);
      const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const filtered = isModerator
        ? all
        : all.filter((c) => c.status !== "rejected" && c.status !== "spam");
      setComments(filtered);
    } catch (e) {
      console.error("Failed to load comments", e);
    } finally {
      setLoading(false);
    }
  }, [contentId, isModerator]);

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
        userPhoto: user.photoURL || gravatarUrl(user.email) || null,
        text: text.trim(),
        claps: [],
        status: "approved",
        createdAt: serverTimestamp(),
      });
      setText("");
      await loadComments();
    } catch (e) {
      console.error("Failed to post comment", e.code, e.message);
      if (e.code === "permission-denied") {
        setError("Please verify your email before posting comments.");
      } else {
        setError("Failed to post comment.");
      }
    } finally {
      setSending(false);
    }
  };

  const handleClap = async (commentId, claps = []) => {
    if (!user) {
      navigate("/login");
      return;
    }
    const hasClapped = claps.includes(user.uid);
    try {
      await updateDoc(doc(db, "comments", commentId), {
        claps: hasClapped ? arrayRemove(user.uid) : arrayUnion(user.uid),
      });
      await loadComments();
    } catch (e) {
      console.error("Failed to update clap", e);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await deleteDoc(doc(db, "comments", commentId));
      await loadComments();
    } catch (e) {
      console.error("Failed to delete comment", e);
    }
  };

  const handleModerate = async (commentId, status) => {
    try {
      await updateDoc(doc(db, "comments", commentId), { status });
      await loadComments();
    } catch (e) {
      console.error("Failed to moderate comment", e);
    }
  };

  const commentActions = (c) => (
    <div className="d-flex gap-1">
      <Button
        variant="link"
        size="sm"
        className={`p-0 text-decoration-none ${c.claps?.includes(user?.uid) ? "text-warning" : "text-secondary"}`}
        onClick={() => handleClap(c.id, c.claps)}
        title="Like"
        style={{ fontSize: "12px" }}
      >
        <FaThumbsUp className="me-1" />{(c.claps?.length || 0) > 0 && <span>{c.claps.length}</span>}
      </Button>
      {isModerator && (
        <>
          {c.status !== "rejected" ? (
            <Button variant="link" size="sm" className="p-0 text-secondary text-decoration-none" onClick={() => handleModerate(c.id, "rejected")} title="Reject" style={{ fontSize: "12px" }}>
              <FaBan />
            </Button>
          ) : (
            <Button variant="link" size="sm" className="p-0 text-success text-decoration-none" onClick={() => handleModerate(c.id, "approved")} title="Approve" style={{ fontSize: "12px" }}>
              <FaCheck />
            </Button>
          )}
          <Button variant="link" size="sm" className="p-0 text-danger text-decoration-none" onClick={() => handleDelete(c.id)} title="Delete" style={{ fontSize: "12px" }}>
            <FaTrash />
          </Button>
        </>
      )}
    </div>
  );

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
              <Link to={`/profile/${c.userId}`} className="text-decoration-none flex-shrink-0">
                {c.userPhoto ? (
                  <img src={c.userPhoto} alt="" width="36" height="36" className="rounded-circle" />
                ) : (
                  <FaUserCircle size={36} className="text-secondary" />
                )}
              </Link>
              <div className="flex-grow-1">
                <div className="d-flex gap-2 align-items-baseline">
                  <Link to={`/profile/${c.userId}`} className="text-decoration-none"><strong className="small text-light">{c.userName}</strong></Link>
                  <span className="text-secondary" style={{ fontSize: "11px" }}>
                    {c.createdAt?.toDate?.()?.toLocaleDateString() || ""}
                  </span>
                  {c.status === "rejected" && <span className="badge bg-danger" style={{ fontSize: "9px" }}>Rejected</span>}
                  {c.status === "spam" && <span className="badge bg-warning text-dark" style={{ fontSize: "9px" }}>Spam</span>}
                </div>
                <p className="mb-0 small mt-1" style={{ whiteSpace: "pre-wrap" }}>{c.text}</p>
                <div className="mt-1">{commentActions(c)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {user ? (
        user.emailVerified ? (
          <Form onSubmit={handleSubmit}>
            <div className="d-flex gap-2">
              <Link to={`/profile/${user.uid}`} className="text-decoration-none flex-shrink-0">
                {user.photoURL ? (
                  <img src={user.photoURL || gravatarUrl(user.email)} alt="" width={32} height={32} className="rounded-circle" />
                ) : (
                  <FaUserCircle size={32} className="text-secondary" />
                )}
              </Link>
              <Form.Group className="flex-grow-1 mb-2">
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Write a comment..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="text-light border-secondary"
                  style={{ background: '#2a2a2a', borderRadius: '6px' }}
                  required
                />
              </Form.Group>
            </div>
            {error && <Alert variant="danger" className="py-1 small">{error}</Alert>}
            <div className="text-end">
              <Button type="submit" disabled={sending || !text.trim()}>
                {sending ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </Form>
        ) : (
          <Alert variant="warning" className="py-2 small mb-0">
            Please verify your email before posting comments.
          </Alert>
        )
      ) : (
        <div className="d-flex align-items-center gap-2 text-secondary small">
          <FaGoogle /> <Button variant="link" size="sm" onClick={signInWithGoogle} className="p-0">Sign in with Google</Button> to leave a comment.
        </div>
      )}
    </div>
  );
}
