import React, { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  doc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { Button, Form, Alert, Spinner } from "react-bootstrap";
import {
  FaUserCircle, FaGoogle, FaThumbsUp, FaRegThumbsUp,
  FaTrash, FaCheck, FaBan, FaReply,
} from "react-icons/fa";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import gravatarUrl from "../utils/gravatar";
import { col } from "../utils/firestorePath";

export default function Comments({ contentId }) {
  const { user, profile, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [clapCount, setClapCount] = useState(0);
  const [userClapped, setUserClapped] = useState(false);
  const [clapLoading, setClapLoading] = useState(false);

  const isModerator = profile?.role === "moderator";

  const loadComments = useCallback(async () => {
    if (!contentId) return;
    try {
      const q = query(
        collection(db, col("comments")),
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
  }, [contentId, isModerator]);

  const loadClaps = useCallback(async () => {
    if (!contentId) return;
    try {
      const snap = await getDoc(doc(db, col("claps"), contentId));
      if (snap.exists()) {
        const data = snap.data();
        setClapCount(data.count || 0);
        if (user) setUserClapped(data.userIds?.includes(user.uid) || false);
      }
    } catch (e) {
      console.error("Failed to load claps", e);
    }
  }, [contentId, user]);

  useEffect(() => {
    loadComments();
    loadClaps();
  }, [loadComments, loadClaps]);

  // Auto-clap when returning from login with ?like=1
  useEffect(() => {
    if (user && searchParams.get("like") === "1") {
      const url = new URL(window.location);
      url.searchParams.delete("like");
      window.history.replaceState({}, "", url);
      autoClap();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, searchParams]);

  const autoClap = async () => {
    setClapLoading(true);
    try {
      const ref = doc(db, col("claps"), contentId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        if (data.userIds?.includes(user.uid)) return;
        await setDoc(ref, { userIds: arrayUnion(user.uid), count: (data.count || 0) + 1 }, { merge: true });
        setUserClapped(true);
        setClapCount(c => c + 1);
      } else {
        await setDoc(ref, { userIds: [user.uid], count: 1 });
        setUserClapped(true);
        setClapCount(1);
      }
    } catch (e) {
      console.error("Failed to clap", e);
    } finally {
      setClapLoading(false);
    }
  };

  const handleClap = () => {
    if (!user) {
      navigate("/login?redirect=" + encodeURIComponent(window.location.pathname) + "&like=1");
      return;
    }
    toggleClap();
  };

  const toggleClap = async () => {
    setClapLoading(true);
    try {
      const ref = doc(db, col("claps"), contentId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        if (data.userIds?.includes(user.uid)) {
          await setDoc(ref, { userIds: arrayRemove(user.uid), count: Math.max(0, (data.count || 1) - 1) }, { merge: true });
          setUserClapped(false);
          setClapCount(c => Math.max(0, c - 1));
        } else {
          await setDoc(ref, { userIds: arrayUnion(user.uid), count: (data.count || 0) + 1 }, { merge: true });
          setUserClapped(true);
          setClapCount(c => c + 1);
        }
      } else {
        await setDoc(ref, { userIds: [user.uid], count: 1 });
        setUserClapped(true);
        setClapCount(1);
      }
    } catch (e) {
      console.error("Failed to clap", e);
    } finally {
      setClapLoading(false);
    }
  };

  const handleSubmit = async (e, parentId) => {
    e.preventDefault();
    const content = parentId ? replyText : text;
    if (!content.trim()) return;
    setSending(true);
    setError("");
    try {
      await addDoc(collection(db, col("comments")), {
        contentId,
        parentId: parentId || null,
        userId: user.uid,
        userName: user.displayName || user.email?.split("@")[0] || "Anonymous",
        userPhoto: user.photoURL || gravatarUrl(user.email) || null,
        text: content.trim(),
        status: "pending",
        createdAt: serverTimestamp(),
      });
      if (parentId) {
        setReplyText("");
        setReplyTo(null);
      } else {
        setText("");
      }
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

  const handleApprove = async (commentId) => {
    try { await updateDoc(doc(db, col("comments"), commentId), { status: "approved" }); await loadComments(); }
    catch (e) { console.error(e); }
  };

  const handleReject = async (commentId) => {
    try { await updateDoc(doc(db, col("comments"), commentId), { status: "rejected" }); await loadComments(); }
    catch (e) { console.error(e); }
  };

  const canDelete = (c) => user && c.userId === user.uid;

  const handleDelete = async (commentId) => {
    if (!window.confirm("Remove this comment?")) return;
    try {
      await updateDoc(doc(db, col("comments"), commentId), {
        status: "deleted",
        text: "",
      });
      await loadComments();
    }
    catch (e) { console.error(e); }
  };

  const visible = (c) => {
    if (isModerator) return true;
    if (user && c.userId === user.uid) return true;
    if (c.status === "approved" || !c.status) return true;
    if (c.status === "rejected" || c.status === "deleted") return true;
    if (c.parentId) {
      const parent = comments.find(p => p.id === c.parentId);
      if (parent?.status === "rejected" || parent?.status === "deleted") return true;
    }
    return false;
  };

  const topLevel = comments.filter((c) => !c.parentId && visible(c));
  const replies = (parentId) => comments.filter((c) => c.parentId === parentId && visible(c));

  const renderComment = (c, depth = 0) => {
    if (!visible(c)) return null;
    const removed = c.status === "deleted" || c.status === "rejected";
    const removedText = c.status === "deleted"
      ? "[removed by the author]"
      : "[removed by a moderator]";
    return (
    <div key={c.id} className="d-flex gap-2 mb-2" style={{ marginLeft: depth > 0 ? `${depth * 24}px` : 0 }}>
      <Link to={`/profile/${c.userId}`} className="text-decoration-none flex-shrink-0" style={{ marginTop: "2px" }}>
        {removed ? (
          <FaUserCircle size={depth > 0 ? 24 : 36} className="text-secondary" style={{ opacity: 0.4 }} />
        ) : c.userPhoto ? (
          <img src={c.userPhoto} alt="" width={depth > 0 ? 24 : 36} height={depth > 0 ? 24 : 36} className="rounded-circle" />
        ) : (
          <FaUserCircle size={depth > 0 ? 24 : 36} className="text-secondary" />
        )}
      </Link>
      <div className="flex-grow-1 p-2 rounded" style={{ background: depth > 0 ? "#252525" : "#1e1e1e" }}>
        {removed ? (
          <p className="small mb-0" style={{ color: "#6c757d", fontStyle: "italic" }}>
            {removedText}
          </p>
        ) : (
        <>
        <div className="d-flex gap-2 align-items-baseline flex-wrap">
          <Link to={`/profile/${c.userId}`} className="text-decoration-none"><strong className="small text-light">{c.userName}</strong></Link>
          <span className="text-secondary" style={{ fontSize: "11px" }}>
            {c.createdAt?.toDate?.()?.toLocaleDateString() || ""}
          </span>
          {c.status === "pending" ? (
            <span className="badge bg-warning text-dark" style={{ fontSize: "9px" }}>Pending</span>
          ) : c.status === "rejected" ? (
            <span className="badge bg-danger" style={{ fontSize: "9px" }}>Rejected</span>
          ) : null}
        </div>
        <p className="mb-0 small mt-1" style={{ whiteSpace: "pre-wrap" }}>{c.text}</p>

        <div className="d-flex gap-2 mt-1 align-items-center">
          {user && (user.emailVerified || isModerator) && (
            <button
              className="btn btn-sm btn-link text-secondary p-0 text-decoration-none"
              style={{ fontSize: "11px" }}
              onClick={() => { setReplyTo(replyTo === c.id ? null : c.id); }}
              title="Reply"
            >
              <FaReply />
            </button>
          )}
          {canDelete(c) && (
            <button className="btn btn-sm btn-link text-danger p-0 text-decoration-none" style={{ fontSize: "11px", lineHeight: 1 }} onClick={() => handleDelete(c.id)} title="Delete">
              <FaTrash />
            </button>
          )}
          {isModerator && c.status !== "approved" && (
            <button className="btn btn-sm btn-link text-success p-0 text-decoration-none" style={{ fontSize: "11px" }} onClick={() => handleApprove(c.id)} title="Approve">
              <FaCheck />
            </button>
          )}
          {isModerator && c.status !== "rejected" && (
            <button className="btn btn-sm btn-link text-warning p-0 text-decoration-none" style={{ fontSize: "11px" }} onClick={() => handleReject(c.id)} title="Reject">
              <FaBan />
            </button>
          )}
        </div>

        {replyTo === c.id && (
          <Form onSubmit={(e) => handleSubmit(e, c.id)} className="mt-2">
            <div className="d-flex gap-2">
              <Form.Group className="flex-grow-1">
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder={`Reply to ${c.userName}...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="text-light border-secondary"
                  style={{ background: '#2a2a2a', borderRadius: '6px', fontSize: "13px" }}
                  required
                />
              </Form.Group>
            </div>
            <div className="text-end mt-1">
              <Button type="submit" size="sm" disabled={sending || !replyText.trim()} style={{ fontSize: "12px" }}>
                {sending ? "Posting..." : "Reply"}
              </Button>
            </div>
          </Form>
        )}
        </>
        )}

        {replies(c.id).map((r) => renderComment(r, depth + 1))}
      </div>
    </div>
    );
  };

  return (
    <div className="mt-5" style={{ borderTop: "1px solid #333", paddingTop: "2rem" }}>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h5 className="mb-0">Comments</h5>
        <div className="d-flex align-items-center gap-3">
          {isModerator && (
            <span className="badge bg-warning text-dark" style={{ fontSize: "10px" }}>
              {comments.filter(c => c.status === "pending").length} pending
            </span>
          )}
          <button
            className={`btn btn-sm ${userClapped ? "btn-warning" : "btn-outline-secondary"}`}
            onClick={handleClap}
            disabled={clapLoading}
            title={user ? "Like this article" : "Sign in to like"}
          >
            {userClapped ? <FaThumbsUp className="me-1" /> : <FaRegThumbsUp className="me-1" />}
            {clapCount > 0 && <span>{clapCount}</span>}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4"><Spinner animation="border" variant="light" size="sm" /></div>
      ) : topLevel.length === 0 ? (
        <p className="text-secondary small mb-4">No comments yet.</p>
      ) : (
        <div className="mb-4">
          {topLevel.map((c) => renderComment(c))}
        </div>
      )}

      {user ? (
        user.emailVerified ? (
          <Form onSubmit={(e) => handleSubmit(e, null)}>
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
