import React, { useState, useEffect } from "react";
import GuitaleleViewer from "./GuitaleleViewer";
import TabEditor from "./TabEditor";

export default function TabViewer(props) {

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

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

    // Switch workspace boundaries smoothly based on status switches
    if (isEditing) {
        return <TabEditor initialScore={data} onExit={() => setIsEditing(false)} />;
    }

    return props.tab && data ? (
        <div className="bg-slate-950 min-h-screen text-slate-100 p-6 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                    <h3 className="text-lg font-bold tracking-tight text-slate-300">Score Viewer</h3>
                    <p className="text-xs text-slate-500 font-sans">Read-only interactive playback.</p>
                </div>
                <button
                    onClick={() => setIsEditing(true)}
                    className="px-5 py-2 rounded-lg text-xs font-mono font-bold tracking-wide bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-md transition-all self-start sm:self-auto"
                >
                    🔧 OPEN IN RUNTIME EDITOR
                </button>
            </div>

            <div className="mt-2">
                <GuitaleleViewer scoreData={data} editorMode={false} />
            </div>
        </div>
    ) : <></>;
}
