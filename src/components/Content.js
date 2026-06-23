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

    useEffect(() => {
        const contentId = params.contentId;

        if (contentId && contentId.startsWith("u-")) {
            setError(null);
            setLoadingUserScore(true);
            const firestoreId = contentId.slice(2);
            (async () => {
                try {
                    const snap = await getDoc(doc(db, "scores", firestoreId));
                    if (!snap.exists()) {
                        console.error("Score doc not found:", firestoreId);
                        setError({ message: "Score not found." });
                        return;
                    }
                    const data = { id: snap.id, ...snap.data() };
                    if (!data.published && data.userId !== user?.uid) {
                        console.error("Score unpublished:", { owner: data.userId, viewer: user?.uid });
                        setError({ message: "Score not found." });
                        return;
                    }
                    setPublishDate(data.createdAt
                        ? new Date(data.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
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
            })();
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
    }, [params.contentId, user]);

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
                    <Row className="mt-3">
                        {publishDate ? <Col><b>Published: </b>{publishDate}</Col> : <></>}
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
                        <Row>
                            {publishDate ? <Col><b>{window.findProp("labels.publishedOn")}</b>{publishDate}</Col> : <></>}
                            {lastUpdated ? <Col><b>{window.findProp("labels.lastUpdated")}</b>{lastUpdated}</Col> : <></>}
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
