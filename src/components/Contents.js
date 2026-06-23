import { useState, useEffect } from "react"
import { Col, Container, Row } from "react-bootstrap"
import PageIntro from "./PageIntro"
import { useParams } from "react-router";
import ContentList from "./ContentList";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";

export default function Contents() {
    const type = useParams().type;
    const { user } = useAuth();
    const [userScores, setUserScores] = useState([]);
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
                    publishDate: data.createdAt
                        ? new Date(data.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
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
            scores.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
            setUserScores(scores);
        } catch (e) {
            console.error("Failed to load user scores", e);
        }
    };

    useEffect(() => {
        loadScores();
    }, [user]);

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
        default:
            header = window.findProp("pages.contents.header");
            intro = window.findProp("pages.contents.intro");
            h1Color = window.findProp("pages.contents.h1Color")
            break;
    }

    const siteName = window.findProp("name") || "Site";
    const isMusic = !type || type === "music";

    return <>
        <Container fluid>
            <PageIntro
                h1={header}
                p={intro}
                h1Color={h1Color}
                pColor={window.findProp("pages.contents.pColor")}
            />

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
                {!type || type === "tech" ? <Col><ContentList showDate type="contents.swe" /></Col> : <></>}
                {isMusic ? (
                    <Col>
                        <h4 style={{ color: window.findProp("pages.contents.musicHeadColor") }} className="mb-3">
                            {siteName}&#39;s Scores
                        </h4>
                        <ContentList showDate type="contents.music" />
                        {user && (
                            <>
                                <hr className="text-secondary" />
                                <div className="d-flex align-items-center gap-3 mb-3">
                                    <h4 style={{ color: window.findProp("pages.contents.musicHeadColor") }} className="mb-0">
                                        Your Scores
                                    </h4>
                                    <a href="/tab-parser" className="btn btn-sm btn-outline-info">+ New</a>
                                </div>
                                {userScores.length > 0 ? (
                                    <ContentList showDate type="__user_scores__" extraContents={userScores} />
                                ) : (
                                    <p className="text-secondary small">No scores yet. <a href="/tab-parser" className="text-info">Create one</a>.</p>
                                )}
                            </>
                        )}
                    </Col>
                ) : <></>}
            </Row>
        </Container >
    </>
}
