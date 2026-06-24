import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { parseShorthandText } from "./tab-viewer/parseShorthandUtils";
import GuitaleleViewer from "./tab-viewer/GuitaleleViewer";
import Blog from "./Blog";
import Yt from "./Yt";
import Both from "./Both";
import TabViewer from "./tab-viewer/TabViewer";
import Comments from "./Comments";
import { Row, Col, Container, Spinner, Alert } from "react-bootstrap";
import slugify from "../utils/slugify";

const shareSvg = {
    facebook: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>,
    x: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>,
    reddit: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.51 8.16c.79 0 1.43.64 1.43 1.43 0 .63-.41 1.17-.97 1.36.03.17.05.35.05.53 0 2.73-3.24 4.95-7.23 4.95S3.92 14.21 3.92 11.48c0-.18.02-.36.05-.53-.56-.19-.97-.73-.97-1.36 0-.79.64-1.43 1.43-1.43.38 0 .72.14.99.38a6.26 6.26 0 0 1 3.34-1.06l.63-2.98a.32.32 0 0 1 .38-.26l2.11.44a1.02 1.02 0 0 1 .92-.54c.56 0 1.01.45 1.01 1.01 0 .55-.45 1-1.01 1-.44 0-.82-.28-.95-.68l-1.88-.39-.56 2.65a6.3 6.3 0 0 1 3.27 1.05c.26-.23.6-.37.98-.37zM8.4 12.13c.53 0 .96.43.96.96a.96.96 0 0 1-.96.96.96.96 0 0 1-.96-.96.96.96 0 0 1 .96-.96zm4.67 3.81a3.44 3.44 0 0 1-2.14.69 3.44 3.44 0 0 1-2.14-.69.3.3 0 0 1 .41-.44c.46.39 1.08.62 1.73.62s1.27-.23 1.73-.62a.3.3 0 0 1 .41.44zm-.54-2.85c.53 0 .96.43.96.96a.96.96 0 0 1-.96.96.96.96 0 0 1-.96-.96.96.96 0 0 1 .96-.96z" /></svg>,
    whatsapp: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>,
    telegram: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>,
};

const shareButtons = [
    { name: "Facebook", color: "#1877F2", svg: "facebook" },
    { name: "X", color: "#000000", svg: "x" },
    { name: "Reddit", color: "#FF4500", svg: "reddit" },
    { name: "WhatsApp", color: "#25D366", svg: "whatsapp" },
    { name: "Telegram", color: "#0088cc", svg: "telegram" },
];

function ShareRow({ url, title }) {
    const u = encodeURIComponent(url || (typeof window !== "undefined" ? window.location.href : ""));
    const t = encodeURIComponent(title || "Check out this score");
    const links = {
        Facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
        X: `https://x.com/intent/tweet?text=${t}&url=${u}`,
        Reddit: `https://www.reddit.com/submit?url=${u}&title=${t}`,
        WhatsApp: `https://wa.me/?text=${encodeURIComponent((title || "Check out this score") + " " + (url || (typeof window !== "undefined" ? window.location.href : "")))}`,
        Telegram: `https://t.me/share/url?url=${u}&text=${t}`,
    };
    return (
        <div className="d-flex gap-1 align-items-center">
            <style>{`.create-score-btn{position:relative;overflow:hidden}.create-score-btn::after{content:"";position:absolute;inset:0;background:linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.35) 50%,transparent 70%);animation:shimmer 2.5s infinite}@keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}`}</style>
            {shareButtons.map(sb => (
                <button key={sb.name} onClick={() => window.open(links[sb.name], "_blank", "noopener,noreferrer,width=600,height=500")} title={`Share on ${sb.name}`} style={{ width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: `1px solid ${sb.color}`, borderRadius: "4px", color: sb.color, cursor: "pointer", opacity: 0.7 }} onMouseEnter={e => e.currentTarget.style.opacity = "1"} onMouseLeave={e => e.currentTarget.style.opacity = "0.7"}>{shareSvg[sb.svg]}</button>
            ))}
            <a href="/tab-parser" className="create-score-btn fw-bold text-decoration-none d-inline-flex align-items-center justify-content-center" style={{ height: "28px", fontSize: "12px", padding: "0 12px", borderRadius: "4px", background: "linear-gradient(90deg, #22d3ee, #10b981)", color: "#fff", border: "none", cursor: "pointer", boxShadow: "0 0 10px rgba(34,197,94,0.4)", transition: "transform 0.15s, boxShadow 0.15s" }} onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.08)"; e.currentTarget.style.boxShadow = "0 0 16px rgba(34,197,94,0.6)"; }} onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 0 10px rgba(34,197,94,0.4)"; }}>+ Create</a>
        </div>
    );
}

export default function Content() {
    const [type, setType] = useState(null);
    const [contentType, setContentType] = useState(null);
    const [ytId, setYtId] = useState(null);
    const [mdUrl, setMdUrl] = useState(null);
    const [tab, setTab] = useState(null);
    const [error, setError] = useState(null);
    const [publishDate, setPublishDate] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    const [userScoreData, setUserScoreData] = useState(null);
    const [loadingUserScore, setLoadingUserScore] = useState(false);

    let params = useParams()
    const { user } = useAuth();

    const loadUserScore = async (scoreId) => {
        setError(null);
        setLoadingUserScore(true);
        try {
            const snap = await getDoc(doc(db, "scores", scoreId));
            if (!snap.exists()) {
                console.error("Score doc not found:", scoreId);
                setError({ message: "Score not found." });
                return;
            }
            const data = { id: snap.id, ...snap.data() };
            if (!data.published && data.userId !== user?.uid) {
                console.error("Score unpublished:", { owner: data.userId, viewer: user?.uid });
                setError({ message: "Score not found." });
                return;
            }
            setPublishDate((data.updatedAt || data.createdAt)
                ? new Date(data.updatedAt || data.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                : null);
            setLastUpdated(data.updatedAt && data.createdAt
                ? new Date(data.updatedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                : null);
            setContentType("music");

            const scoreText =
                "=".repeat(80) +
                "\nScore: " + data.name +
                "\nTime Signature: " + data.timeSignature +
                "\nInstrument: " + data.instrument +
                "\nCapo: " + (data.capo || 0) +
                "\nDescription: " + (data.desc || "") +
                "\n" + "=".repeat(80) +
                "\n" + data.rawShorthand;

            const parsed = parseShorthandText(scoreText);
            setUserScoreData(parsed && parsed.length > 0 ? parsed[0] : null);
            setType("user-score");
        } catch (e) {
            console.error("Failed to load score", e.code, e.message);
            setError({ message: "Failed to load score." });
        } finally {
            setLoadingUserScore(false);
        }
    };

    useEffect(() => {
        const { contentId, username, instrument, titleSlug } = params;

        if (username && instrument && titleSlug) {
            const docId = `${username}:${instrument}:${titleSlug}`;
            loadUserScore(docId);
            return;
        }

        if (contentId && contentId.startsWith("u-")) {
            const firestoreId = contentId.slice(2);
            loadUserScore(firestoreId);
            return;
        }

        setUserScoreData(null);
        const sweContents = window.findProp("contents.swe")
            .map(c => { return { ...c, "contentType": "swe" } })
        const musicContents = window.findProp("contents.music")
            .map(c => { return { ...c, "contentType": "music" } })
        var allContents = sweContents.concat(musicContents).concat(window.findProp("contents.drafts"))

        var content = allContents.find(b => b.id === contentId)
        if (content) {
            if (content.mdUrl && content.videoId) {
                setType("both")
            } else if (content.mdUrl && !content.videoId) {
                setType("markdown")
            } else if (!content.mdUrl && content.videoId) {
                setType("video")
            } else {
                setType(undefined)
            }
            setLastUpdated(content.lastUpdated);
            setPublishDate(content.publishDate);
            setContentType(content.contentType);
            setMdUrl(content.mdUrl);
            setYtId(content.videoId);
            setTab(content.tab);
        } else {
            setError({
                message: window.findProp("labels.contentNotExists")
            });
        }
    }, [params.contentId, params.username, params.instrument, params.titleSlug, user]);

    if (error) return (
        <Container className="mt-4">
            <Alert variant="danger">{error.message}</Alert>
        </Container>
    );

    if (loadingUserScore) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" variant="light" />
            </Container>
        );
    }

    if (type === "user-score") {
        return (
            <>
                <Container fluid>
                    <Row className="mt-3 align-items-center">
                        <Col xs="auto"><b>Last updated: </b>{publishDate}</Col>
                        {lastUpdated ? <Col xs="auto"><b>Created: </b>{lastUpdated}</Col> : <></>}
                        <Col />
                        <Col xs="auto"><ShareRow /></Col>
                    </Row>
                    <GuitaleleViewer scoreData={userScoreData} />
                </Container>
                <Comments contentId={params.contentId} />
            </>
        );
    }

    const contentBody = (() => {
        switch (type) {
            case "markdown": return (
                <>
                    <Blog lastUpdated={lastUpdated} publishDate={publishDate} contentType={contentType} mdUrl={mdUrl} />
                    {tab ?
                        <>
                            <br />
                            <Row style={{ borderTop: '1px solid' }} >
                                <Col>
                                    <br />
                                </Col>
                            </Row>
                            <TabViewer tab={tab} />
                        </> : <></>}
                </>)
            case "video": return (
                <>
                    <Yt ytId={ytId} tab={tab} />
                    {tab ? <>
                        <br />
                        <Row style={{ borderTop: '1px solid' }} >
                            <Col>
                                <br />
                            </Col>
                        </Row>
                        <TabViewer tab={tab} />

                    </> : <></>}
                </>)
            case "both": return <Both lastUpdated={lastUpdated} publishDate={publishDate} contentType={contentType} ytId={ytId} mdUrl={mdUrl} tab={tab} />

            default: {
                if (tab) {
                    return <>
                        <Row className="align-items-center">
                            {publishDate ? <Col xs="auto"><b>{window.findProp("labels.publishedOn")}</b>{publishDate}</Col> : <></>}
                            {lastUpdated ? <Col xs="auto"><b>{window.findProp("labels.lastUpdated")}</b>{lastUpdated}</Col> : <></>}
                            <Col />
                            <Col xs="auto"><ShareRow /></Col>
                        </Row>
                        <TabViewer tab={tab} />
                    </>
                }
                return <div>Unknown Content Type</div>
            }
        }
    })();

    return (
        <>
            {contentBody}
            <Comments contentId={params.contentId} />
        </>
    );
}
