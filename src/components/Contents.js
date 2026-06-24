import { useState, useEffect, useCallback } from "react"
import { Col, Container, Row, Form } from "react-bootstrap"
import PageIntro from "./PageIntro"
import { useParams, Link } from "react-router-dom";
import ContentList from "./ContentList";
import { collection, query, where, getDocs, deleteDoc, doc, limit } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { FaUserCircle, FaSearch } from "react-icons/fa";

export default function Contents() {
    const type = useParams().type;
    const { user } = useAuth();
    const [userScores, setUserScores] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [profiles, setProfiles] = useState([]);
    var intro, header, h1Color;

    const loadScores = async () => {
        if (!user) {
            setUserScores([]);
            return;
        }
        try {
            const q = query(collection(db, "scores"), where("userId", "==", user.uid));
            const snap = await getDocs(q);
            const scores = [];
            snap.forEach((d) => {
                const data = d.data();
                scores.push({
                    id: "u-" + d.id,
                    title: data.name,
                    noLink: !data.published,
                    rawTime: data.updatedAt || data.createdAt,
                    publishDate: (data.updatedAt || data.createdAt)
                        ? new Date(data.updatedAt || data.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                        : null,
                    editLink: "/tab-parser?edit=" + d.id,
                    onDelete: async () => {
                        if (!window.confirm(`Delete "${data.name}"?`)) return;
                        try {
                            await deleteDoc(doc(db, "scores", d.id));
                            await loadScores();
                        } catch (e) {
                            console.error("Failed to delete score", e.code, e.message);
                        }
                    },
                });
            });
            scores.sort((a, b) => (b.rawTime || 0) - (a.rawTime || 0));
            setUserScores(scores);
        } catch (e) {
            console.error("Failed to load user scores", e);
        }
    };

    useEffect(() => {
        loadScores();
    }, [user]);

    const searchProfiles = useCallback(async (q) => {
        if (!q.trim()) { setProfiles([]); return; }
        try {
            const lower = q.toLowerCase().trim();

            const [dnSnap, emailSnap, uSnap] = await Promise.all([
                getDocs(query(collection(db, "profiles"),
                    where("displayName", ">=", q), where("displayName", "<=", q + "\uf8ff"), limit(5))),
                getDocs(query(collection(db, "profiles"),
                    where("email", ">=", q), where("email", "<=", q + "\uf8ff"), limit(5))),
                getDocs(query(collection(db, "profiles"),
                    where("username", ">=", lower), where("username", "<=", lower + "\uf8ff"), limit(5))),
            ]);

            const seen = new Map();
            dnSnap.forEach(d => seen.set(d.id, { id: d.id, ...d.data() }));
            emailSnap.forEach(d => { if (!seen.has(d.id)) seen.set(d.id, { id: d.id, ...d.data() }); });
            uSnap.forEach(d => { if (!seen.has(d.id)) seen.set(d.id, { id: d.id, ...d.data() }); });

            setProfiles(Array.from(seen.values()).slice(0, 5));
        } catch (e) {
            console.error("Profile search error", e);
        }
    }, []);

    useEffect(() => {
        const t = setTimeout(() => searchProfiles(searchQuery), 300);
        return () => clearTimeout(t);
    }, [searchQuery, searchProfiles]);

    switch (type) {
        case "tech":
            header = window.findProp("pages.contents.techHeader");
            intro = window.findProp("pages.contents.techIntro");
            h1Color = window.findProp("pages.contents.sweHeadColor")
            break;
        case "music":
            header = window.findProp("pages.contents.musicHeader");
            intro = window.findProp("pages.contents.musicIntro");
            h1Color = window.findProp("pages.contents.musicHeadColor")
            break;
        case "scores":
            header = window.findProp("pages.contents.scoresHeader") || "Scores";
            intro = window.findProp("pages.contents.scoresIntro") || "Browse and manage your guitar tablature scores";
            h1Color = window.findProp("pages.contents.scoresHeadColor") || window.findProp("pages.contents.musicHeadColor")
            break;
        default:
            header = window.findProp("pages.contents.header");
            intro = window.findProp("pages.contents.intro");
            h1Color = window.findProp("pages.contents.h1Color")
            break;
    }

    const siteName = window.findProp("name") || "Site";
    const isDefault = !type;
    const isMusic = type === "music";
    const isScores = type === "scores";
    const showSearch = isScores;
    const filterProp = searchQuery.trim() || undefined;

    return <>
        <Container fluid>
            <PageIntro
                h1={header}
                p={intro}
                h1Color={h1Color}
                pColor={window.findProp("pages.contents.pColor")}
            />

            {showSearch && (
                <div className="position-relative mb-3" style={{ maxWidth: 400 }}>
                    <FaSearch className="position-absolute text-secondary" style={{ left: 12, top: 10, fontSize: 13 }} />
                    <Form.Control
                        type="text"
                        placeholder="Search users &amp; scores..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="bg-dark text-light border-secondary ps-5"
                    />
                    {profiles.length > 0 && searchQuery.trim() && (
                        <div className="position-absolute w-100 mt-1 rounded shadow-lg" style={{ background: "#1e1e1e", zIndex: 10, border: "1px solid #333" }}>
                            {profiles.map(p => (
                                <Link key={p.id} to={`/profile/${p.username ? `@${p.username}` : p.id}`} className="d-flex align-items-center gap-2 p-2 text-decoration-none text-light" style={{ borderBottom: "1px solid #333" }}>
                                    {p.photoURL ? <img src={p.photoURL} alt="" width={28} height={28} className="rounded-circle" /> : <FaUserCircle size={28} className="text-secondary" />}
                                    <div>
                                        <div className="small">{p.displayName}</div>
                                        {p.username && <span className="text-secondary" style={{ fontSize: "11px" }}>@{p.username}</span>}
                                        {p.email && <span className="text-secondary ms-2" style={{ fontSize: "11px" }}>{p.email}</span>}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {searchQuery.trim() && profiles.length === 0 && showSearch && (
                <p className="text-secondary small mb-3">No users found for &ldquo;{searchQuery}&rdquo;</p>
            )}

            <Row>
                {
                    !type ?
                        <Col>
                            <h2 style={{ color: window.findProp("pages.contents.sweHeadColor") }}>
                                {window.findProp("labels.swe")}
                            </h2>
                        </Col>
                        : <></>
                }
                {
                    !type ?
                        <Col>
                            <h2 style={{ color: window.findProp("pages.contents.musicHeadColor") }}>
                                {window.findProp("labels.music")}
                            </h2>
                        </Col>
                        : <></>
                }
            </Row>
            <Row>
                {isDefault || type === "tech" ? <Col><ContentList showDate type="contents.swe" filter={filterProp} /></Col> : <></>}
                {isDefault || isMusic ? <Col><ContentList showDate type="contents.music" filter={filterProp} /></Col> : <></>}
                {isScores ? (
                    <Col>
                        {user && (
                            <div id="your-scores">
                                <hr className="text-secondary" />
                                <div className="d-flex align-items-center gap-3 mb-3">
                                    <h4 style={{ color: window.findProp("pages.contents.musicHeadColor") }} className="mb-0">
                                        Your Scores
                                    </h4>
                                    <a href="/tab-parser" className="btn btn-sm btn-outline-info">+ New</a>
                                </div>
                                {userScores.length > 0 ? (
                                    <ContentList showDate type="__user_scores__" extraContents={userScores} filter={filterProp} />
                                ) : (
                                    <p className="text-secondary small">No scores yet. <a href="/tab-parser" className="text-info">Create one</a>.</p>
                                )}
                            </div>
                        )}
                        {!user && (
                            <div className="text-center mt-3 pt-3 border-top border-secondary">
                                <p className="text-secondary mb-2">Sign in to create and save your own scores</p>
                                <a href="/login" className="btn btn-outline-info">Sign In</a>
                            </div>
                        )}
                    </Col>
                ) : <></>}
            </Row>
        </Container >
    </>
}
