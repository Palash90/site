import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Blog from "./Blog";
import YouTube from "react-youtube";
import { Container } from "react-bootstrap";
import Yt from "./Yt";

export default function Content() {
    const [mdData, setMdData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [type, setType] = useState(null);
    const [ytUrl, setYtUrl] = useState(null);

    let params = useParams()

    useEffect(() => {
        var content = window.findProp("contents.swe").concat(window.findProp("contents.music")).find(b => b.id == params.contentId)

        function fetchMarkDown(url) {
            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.text();
                })
                .then(data => {
                    setMdData(data);
                    setLoading(false);
                })
                .catch(error => {
                    setError(error);
                    setLoading(false);
                });
        }

        if (content) {
            setType(content.type)
            switch (content.type) {
                case "markdown":
                    fetchMarkDown(content.url);
                    break;
                case "video":
                    setYtUrl(content.url);
                    setLoading(false);
                    break;
                case "both":
                    setYtUrl(content.video);
                    fetchMarkDown(content.md);
                    setLoading(false);
                    break;
                default:
                    break;
            }

        } else {
            setError({ message: window.findProp("labels.contentNotExists") });
            setLoading(false);
        }


    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    switch (type) {
        case "markdown": return <Blog data={mdData} />
        case "video": return <Yt ytUrl={ytUrl} />
        case "both": return <div><Yt ytUrl={ytUrl} /><Blog data={mdData} /></div>
        default: return <div>Unknown Content Type</div>
    }
}