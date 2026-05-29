import React, { useState, useEffect } from "react";
import GuitaleleViewer from "./GuitaleleViewer";

export default function TabViewer(props) {

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Clear old states when moving across different tabs/blogs
        setLoading(true);
        setError(null);

        fetch(props.tab)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(textData => {
                setData(JSON.parse(textData));
                setLoading(false);
            })
            .catch(err => {
                setError(err);
                setLoading(false);
            });
    }, [props.tab]);

    if (loading) return <p className="text-slate-400 p-6 font-mono text-xs">Loading context elements...</p>;
    if (error) return <p className="text-rose-500 p-6 font-mono text-xs">Error loading score structure: {error.message}</p>;

    return props.tab && data ? (
        <div className="bg-slate-950 min-h-screen text-slate-100 p-6 flex flex-col gap-4">
            <div className="mt-2">
                <h3 className="text-lg font-bold tracking-tight text-slate-300">Score Viewer</h3>
                <GuitaleleViewer scoreData={data} editorMode={false} />
            </div>
        </div>
    ) : <></>;
}
