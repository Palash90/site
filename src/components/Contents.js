import { useState, useEffect, useCallback } from "react"
import { Col, Container, Row, Form } from "react-bootstrap"
import PageIntro from "./PageIntro"
import { useParams, Link } from "react-router-dom";
import SeriesList from "./SeriesList";
import { collection, query, where, getDocs, doc, limit, orderBy, startAfter } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { FaUserCircle, FaSearch, FaMusic } from "react-icons/fa";
import slugify from "../utils/slugify";
import { col } from "../utils/firestorePath";

const SCORES_PER_PAGE = 10;

export default function Contents() {
    const type = useParams().type;
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [profiles, setProfiles] = useState([]);
    const [scoreResults, setScoreResults] = useState([]);
    const [searchError, setSearchError] = useState("");
    const [latestScores, setLatestScores] = useState([]);
    const [lastDoc, setLastDoc] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [loadingLatest, setLoadingLatest] = useState(false);
    var intro, header, h1Color;
    const isScores = type === "scores";

    const loadLatestScores = async (loadMore = false) => {
        setLoadingLatest(true);
        try {
            let q;
            if (loadMore && lastDoc) {
                q = query(
                    collection(db, col("scores")),
                    where("published", "==", true),
                    orderBy("createdAt", "desc"),
                    startAfter(lastDoc),
                    limit(SCORES_PER_PAGE + 1)
                );
            } else {
                q = query(
                    collection(db, col("scores")),
                    where("published", "==", true),
                    orderBy("createdAt", "desc"),
                    limit(SCORES_PER_PAGE + 1)
                );
            }

            const snap = await getDocs(q);
            const scores = [];
            let last = null;

            snap.forEach((d) => {
                const data = d.data();
                const hasComposite = data.username && data.slug && data.instrument;
                const id = hasComposite
                    ? `${data.username}/${slugify(data.instrument)}/${data.slug}`
                    : "u-" + d.id;
                scores.push({
                    id,
                    title: data.name,
                    username: data.username,
                    publishDate: data.createdAt
                        ? new Date(data.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                        : null,
                    rawTime: data.createdAt,
                });
                last = d;
            });

            if (scores.length > SCORES_PER_PAGE) {
                scores.pop();
                setHasMore(true);
                setLastDoc(last);
            } else {
                setHasMore(false);
                setLastDoc(null);
            }

            if (loadMore) {
                setLatestScores(prev => [...prev, ...scores]);
            } else {
                setLatestScores(scores);
            }
        } catch (e) {
            console.error("Failed to load latest scores", e);
            setLatestScores([]);
        } finally {
            setLoadingLatest(false);
        }
    };

    useEffect(() => {
        if (isScores && !searchQuery.trim()) {
            loadLatestScores(false);
        }
    }, [type, searchQuery]);

    const searchProfiles = useCallback(async (q) => {
        if (!q.trim()) { setProfiles([]); return; }
        try {
            const lower = q.toLowerCase().trim();

            const [dnSnap, emailSnap, uSnap] = await Promise.all([
                getDocs(query(collection(db, col("profiles")),
                    where("displayName", ">=", q), where("displayName", "<=", q + "\uf8ff"), limit(5))),
                getDocs(query(collection(db, col("profiles")),
                    where("email", ">=", q), where("email", "<=", q + "\uf8ff"), limit(5))),
                getDocs(query(collection(db, col("profiles")),
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

    const searchScores = useCallback(async (q) => {
        if (!q.trim()) { setScoreResults([]); setSearchError(""); return; }
        setSearchError("");
        const lower = q.toLowerCase().trim();
        const seen = new Map();
        const addResult = (d) => {
            const data = d.data();
            if (!data.published) return;
            const hasComposite = data.username && data.slug && data.instrument;
            const urlId = hasComposite
                ? `${data.username}/${slugify(data.instrument)}/${data.slug}`
                : "u-" + d.id;
            if (!seen.has(urlId)) {
                seen.set(urlId, { id: urlId, name: data.name, username: data.username });
            }
        };
        try {
            const snap = await getDocs(query(collection(db, col("scores")),
                where("name", ">=", q),
                where("name", "<=", q + "\uf8ff"),
                limit(10)));
            snap.forEach(addResult);
        } catch (e) {
            console.error("Score name search error", e);
        }
        try {
            const snap = await getDocs(query(collection(db, col("scores")),
                where("nameLower", ">=", lower),
                where("nameLower", "<=", lower + "\uf8ff"),
                limit(10)));
            snap.forEach(addResult);
        } catch (e) {
            console.error("Score lowercase search error", e);
        }
        setScoreResults(Array.from(seen.values()).slice(0, 5));
    }, []);

    useEffect(() => {
        const t = setTimeout(() => { searchProfiles(searchQuery); searchScores(searchQuery); }, 300);
        return () => clearTimeout(t);
    }, [searchQuery, searchProfiles, searchScores]);

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
            intro = window.findProp("pages.contents.scoresIntro") || "Browse and manage your tablature scores";
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
    const showSearch = isScores || isMusic;
    const filterProp = searchQuery.trim() || undefined;

    const searchPanel = (
        <div className="position-relative mb-3" style={{ maxWidth: 400 }}>
            <FaSearch className="position-absolute text-secondary" style={{ left: 12, top: 10, fontSize: 13 }} />
            <Form.Control
                type="text"
                placeholder="Search users &amp; scores..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-dark text-light border-secondary ps-5"
            />
            {(profiles.length > 0 || scoreResults.length > 0) && searchQuery.trim() && (
                <div className="position-absolute w-100 mt-1 rounded shadow-lg" style={{ background: "#1e1e1e", zIndex: 9999, border: "1px solid #333", maxHeight: "calc(100vh - 250px)", overflowY: "auto" }}>
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
                    {scoreResults.map(s => (
                        <Link key={"score-" + s.id} to={`/content/${s.id}`} className="d-flex align-items-center gap-2 p-2 text-decoration-none text-light" style={{ borderBottom: "1px solid #333" }}>
                            <FaMusic size={20} className="text-info" />
                            <div>
                                <div className="small">{s.name}</div>
                                <span className="text-secondary" style={{ fontSize: "11px" }}>Score{s.username ? ` by @${s.username}` : ""}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );

    const searchFeedback = (
        <>
            {searchQuery.trim() && profiles.length === 0 && scoreResults.length === 0 && showSearch && !searchError && (
                <p className="text-secondary small mb-3">No users or scores found for &ldquo;{searchQuery}&rdquo;</p>
            )}
            {searchError && (
                <p className="text-warning small mb-3">Search error: {searchError}</p>
            )}
        </>
    );

    return <>
        <Container fluid className="contents-page">
            <PageIntro
                h1={header}
                p={intro}
                h1Color={h1Color}
                pColor={window.findProp("pages.contents.pColor")}
            />

            {isScores && searchPanel}
            {isScores && searchFeedback}

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
                {isDefault || type === "tech" ? <Col><SeriesList showDate type="contents.swe" filter={filterProp} /></Col> : <></>}
                {isDefault || isMusic ? <Col><SeriesList showDate type="contents.music" filter={filterProp} /></Col> : <></>}
                {isMusic && (
                    <Col xs={12} className="mt-4">
                        <hr className="text-secondary" />
                        <p className="mb-0">
                            <Link to="/contents/scores" className="btn btn-outline-info">
                                Browse Scores
                            </Link>
                        </p>
                    </Col>
                )}
                {isScores ? (
                    <Col xs={12} md={9} lg={8}>
                        <div className="d-flex align-items-center gap-3 mb-3">
                            <h4 style={{ color: window.findProp("pages.contents.musicHeadColor") }} className="mb-0">
                                Latest Scores
                            </h4>
                            {user && <a href="/tab-parser" className="btn btn-sm btn-outline-info">+ New</a>}
                        </div>

                        {latestScores.length > 0 && !searchQuery.trim() && (
                            <div>
                                <div className="d-flex flex-column" style={{ gap: '6px' }}>
                                    {latestScores.map(s => (
                                        <Link key={s.id} to={`/content/${s.id}`}
                                            className="d-flex align-items-center rounded border p-2 text-decoration-none"
                                            style={{ gap: '10px', background: '#1e293b', borderColor: '#334155', transition: 'background 0.15s, border-color 0.15s', cursor: 'pointer' }}
                                            onMouseEnter={e => { e.currentTarget.style.background = '#243150'; e.currentTarget.style.borderColor = '#22d3ee'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.borderColor = '#334155'; }}>
                                            {s.publishDate && (
                                                <span style={{ fontSize: '10px', color: '#64748b', whiteSpace: 'nowrap', width: '85px', flexShrink: 0 }}>
                                                    {s.publishDate}
                                                </span>
                                            )}
                                            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '13px', color: '#e2e8f0' }}>
                                                {s.title}
                                            </span>
                                            {s.username && (
                                                <span style={{ fontSize: '10px', color: '#64748b', whiteSpace: 'nowrap' }}>
                                                    @{s.username}
                                                </span>
                                            )}
                                        </Link>
                                    ))}
                                </div>
                                {hasMore && (
                                    <div className="text-center mt-3">
                                        <button
                                            className="btn btn-sm btn-outline-secondary"
                                            onClick={() => loadLatestScores(true)}
                                            disabled={loadingLatest}
                                        >
                                            {loadingLatest ? "Loading..." : "Load More"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {latestScores.length === 0 && !searchQuery.trim() && !loadingLatest && (
                            <div className="text-center text-secondary py-4 rounded border" style={{ background: '#1e293b', borderColor: '#334155' }}>
                                <FaMusic size={32} className="mb-2 opacity-50" />
                                <p className="small mb-0">No scores available yet. Be the first to create one!</p>
                            </div>
                        )}

                        {!user && (
                            <div className="text-center mt-3">
                                <a href={"/login?redirect=" + encodeURIComponent("/contents/scores")} className="btn btn-sm btn-outline-secondary">Sign In to Create Scores</a>
                            </div>
                        )}
                    </Col>
                ) : <></>}
            </Row>
        </Container >
    </>
}
