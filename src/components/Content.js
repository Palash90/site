import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Blog from "./Blog";
import Yt from "./Yt";
import Both from "./Both";
import TabViewer from "./TabViewer";

export default function Content() {
    const [type, setType] = useState(null);
    const [contentType, setContentType] = useState(null);
    const [ytId, setYtId] = useState(null);
    const [mdUrl, setMdUrl] = useState(null);
    const [tab, setTab] = useState(null);
    const [error, setError] = useState(null);
    const [publishDate, setPublishDate] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    let params = useParams()

    useEffect(() => {
        const sweContents = window.findProp("contents.swe")
            .map(c => { return { ...c, "contentType": "swe" } })
        const musicContents = window.findProp("contents.music")
            .map(c => { return { ...c, "contentType": "music" } })
        var allContents = sweContents.concat(musicContents).concat(window.findProp("contents.drafts"))

        var content = allContents.find(b => b.id === params.contentId)
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
    }, [params.contentId]);

    if (error) return <p>Error: {error.message}</p>;

    switch (type) {
        case "markdown": return <>
            {tab ? <TabViewer tab={tab} /> : <></>}
            <Blog lastUpdated={lastUpdated} publishDate={publishDate} contentType={contentType} mdUrl={mdUrl} />
        </>
        case "video": return <>
            <Yt ytId={ytId} tab={tab} />
            {tab ? <TabViewer tab={tab} /> : <></>}
        </>
        case "both": return <Both lastUpdated={lastUpdated} publishDate={publishDate} contentType={contentType} ytId={ytId} mdUrl={mdUrl} tab={tab} />

        default: return <div>Unknown Content Type</div>
    }
}