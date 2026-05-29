import React, { useState, useEffect } from "react";
import GuitaleleViewer from "./GuitaleleViewer";
import { allScores } from "./dummy_score";

export default function TabViewerDemo(props) {

    const [data, setData] = useState(null);

    console.log("selected score:", data?.title);

    return (
        <div className="bg-slate-950 min-h-screen text-slate-100 p-6 flex flex-col gap-4">

            <select className="bg-slate-800 text-slate-100 p-2 rounded" onChange={(e) => setData(allScores.find(score => score.title === e.target.value))}>
                <option value="">Select a score to view</option>
                {allScores.map((score, index) => (
                    <option key={index} value={score.title}>
                        {score.title}
                    </option>
                ))}
            </select>

            <div className="mt-2">
                <h3 className="text-lg font-bold tracking-tight text-slate-300">Score Viewer</h3>
                <GuitaleleViewer scoreData={data} editorMode={false} />
            </div>
        </div>
    );
}
