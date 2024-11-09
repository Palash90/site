import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Blog from "./Blog";
import Yt from "./Yt";
import Both from "./Both";

export default function Content() {
    const [type, setType] = useState(null);
    const [ytId, setYtId] = useState(null);
    const [mdUrl, setMdUrl] = useState(null);
    const [error, setError] = useState(null);

    let params = useParams()

    useEffect(() => {
        var content = window.findProp("contents.swe").concat(window.findProp("contents.music")).find(b => b.id === params.contentId)
        if (content) {
            setType(content.type)
            setMdUrl(content.mdUrl);
            setYtId(content.videoId);
        } else {
            setError({
                message: window.findProp("labels.contentNotExists")
            });
        }
    }, [params.contentId]);

    if (error) return <p>Error: {error.message}</p>;

    switch (type) {
        case "markdown": return <Blog mdUrl={mdUrl} />
        case "video": return <Yt ytId={ytId} />
        case "both": return <Both ytId={ytId} mdUrl={mdUrl} />
        default: return <div>Unknown Content Type</div>
    }
}