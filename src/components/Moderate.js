import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { Container, Spinner, Button, Form } from "react-bootstrap";
import { FaCheck, FaBan, FaExternalLinkAlt, FaUserCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import { col } from "../utils/firestorePath";

export default function Moderate() {
  const { profile } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");

  const loadComments = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, col("comments")),
        orderBy("createdAt", "desc"),
        limit(100)
      );
      const snap = await getDocs(q);
      setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadComments(); }, []);

  const handleApprove = async (id) => {
    try { await updateDoc(doc(db, col("comments"), id), { status: "approved" }); await loadComments(); }
    catch (e) { console.error(e); }
  };

  const handleReject = async (id) => {
    try { await updateDoc(doc(db, col("comments"), id), { status: "rejected" }); await loadComments(); }
    catch (e) { console.error(e); }
  };

  if (profile?.role !== "moderator") return null;

  const filtered = filter === "all"
    ? comments
    : comments.filter((c) => c.status === filter);

  return (
    <Container className="py-4" style={{ maxWidth: 800 }}>
      <h4 className="mb-3">Comment Moderation</h4>

      <Form.Group className="mb-3">
        <Form.Select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-dark text-light border-secondary"
          style={{ maxWidth: 200 }}
        >
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
          <option value="all">All</option>
        </Form.Select>
      </Form.Group>

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" variant="light" /></div>
      ) : filtered.length === 0 ? (
        <p className="text-secondary small">No comments found.</p>
      ) : (
        <div>
          {filtered.map((c) => (
            <div key={c.id} className="d-flex gap-2 mb-2 p-2 rounded" style={{ background: "#1e1e1e" }}>
              <div className="flex-shrink-0">
                {c.userPhoto ? (
                  <img src={c.userPhoto} alt="" width={28} height={28} className="rounded-circle" />
                ) : (
                  <FaUserCircle size={28} className="text-secondary" />
                )}
              </div>
              <div className="flex-grow-1">
                <div className="d-flex gap-2 align-items-baseline flex-wrap">
                  <strong className="small">{c.userName}</strong>
                  <span className="text-secondary" style={{ fontSize: "10px" }}>
                    {c.createdAt?.toDate?.()?.toLocaleDateString() || ""}
                  </span>
                  <span className={`badge ${c.status === "pending" ? "bg-warning text-dark" : c.status === "rejected" ? "bg-danger" : "bg-success"}`} style={{ fontSize: "9px" }}>
                    {c.status || "approved"}
                  </span>
                  {c.contentId && (
                    <Link to={`/content/${c.contentId}`} className="text-decoration-none" style={{ fontSize: "10px" }} target="_blank" rel="noopener">
                      <FaExternalLinkAlt className="me-1" />view
                    </Link>
                  )}
                </div>
                <p className="mb-1 small mt-1" style={{ whiteSpace: "pre-wrap" }}>{c.text}</p>
                <div className="d-flex gap-1">
                  {c.status !== "approved" && (
                    <Button size="sm" variant="outline-success" className="py-0 px-1" style={{ fontSize: "11px" }} onClick={() => handleApprove(c.id)}>
                      <FaCheck className="me-1" />Approve
                    </Button>
                  )}
                  {c.status !== "rejected" && (
                    <Button size="sm" variant="outline-warning" className="py-0 px-1" style={{ fontSize: "11px" }} onClick={() => handleReject(c.id)}>
                      <FaBan className="me-1" />Reject
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}
