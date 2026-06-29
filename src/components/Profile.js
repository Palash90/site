import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { Container, Spinner, Row, Col } from "react-bootstrap";
import { FaGlobe, FaBirthdayCake, FaEdit, FaUserCircle } from "react-icons/fa";
import slugify from "../utils/slugify";
import { col } from "../utils/firestorePath";

export default function Profile() {
  const { identifier } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [profileUid, setProfileUid] = useState(null);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const key = identifier.startsWith("@") ? identifier.slice(1) : identifier;

    // Try as profile UID first
    let pSnap = await getDoc(doc(db, col("profiles"), key));
    let uid = key;

    if (!pSnap.exists()) {
      // Not a UID — try as username
      const uSnap = await getDoc(doc(db, col("usernames"), key.toLowerCase()));
      if (!uSnap.exists()) { setLoading(false); return; }
      uid = uSnap.data().uid;
      pSnap = await getDoc(doc(db, col("profiles"), uid));
      if (!pSnap.exists()) { setLoading(false); return; }
    }

    setProfile({ id: uid, ...pSnap.data() });
    setProfileUid(uid);

    const q = query(
      collection(db, col("scores")),
      where("userId", "==", uid),
      where("published", "==", true),
      orderBy("updatedAt", "desc")
    );
    const sSnap = await getDocs(q);
    const mapped = sSnap.docs.map(d => {
      const data = d.data();
      const hasComposite = data.username && data.slug && data.instrument;
      return {
        id: hasComposite
          ? `${data.username}/${slugify(data.instrument)}/${data.slug}`
          : "u-" + d.id,
        ...data
      };
    });
    setScores(mapped);
    setLoading(false);
  }, [identifier]);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="light" /></div>;
  if (!profile) return <Container className="py-5"><p className="text-secondary text-center">Profile not found.</p></Container>;

  return (
    <Container className="py-4" style={{ maxWidth: 600 }}>
      <div className="d-flex align-items-center gap-4 mb-4">
        {profile.photoURL ? (
          <img src={profile.photoURL} alt="" width={72} height={72} className="rounded-circle" style={{ objectFit: "cover" }} />
        ) : (
          <FaUserCircle size={72} className="text-secondary" />
        )}
        <div>
          <h4 className="mb-0">{profile.displayName}</h4>
          {profile.username && <span className="text-secondary small">@{profile.username}</span>}
          {profile.website && (
            <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-info small d-flex align-items-center gap-1">
              <FaGlobe size={12} /> {profile.website.replace(/^https?:\/\//, "")}
            </a>
          )}
          {profile.birthday && (
            <span className="text-secondary small d-flex align-items-center gap-1 mt-1">
              <FaBirthdayCake size={12} /> {new Date(profile.birthday + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric" })}
            </span>
          )}
        </div>
        {user && user.uid === profileUid && (
          <div className="d-flex gap-2 ms-auto">
            <Link to="/tab-parser" className="btn btn-outline-info btn-sm">
              + New
            </Link>
            <Link to="/profile/edit" className="btn btn-outline-light btn-sm">
              <FaEdit className="me-1" /> Edit
            </Link>
          </div>
        )}
      </div>
      <h5 className="mb-3">Published Scores</h5>
      {scores.length === 0 ? (
        <p className="text-secondary small">No published scores yet.</p>
      ) : (
        <Row>
          {scores.map(s => (
            <Col xs={12} key={s.id} className="mb-2">
              <Link to={`/content/${s.id}`} className="text-decoration-none d-flex justify-content-between align-items-center p-3 rounded" style={{ background: "#1e1e1e" }}>
                <span className="fw-bold small">{s.name}</span>
                <span className="text-secondary" style={{ fontSize: "11px" }}>
                  {s.updatedAt?.toDate?.()?.toLocaleDateString() || ""}
                </span>
              </Link>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}
