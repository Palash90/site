import React, { useState, useEffect } from 'react';
import GuitaleleViewer from './GuitaleleViewer';
import * as Dummies from './dummy_score';

export default function TabEditor({ initialScore, onExit }) {
    const [jsonText, setJsonText] = useState("");
    const [parsedScore, setParsedScore] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [selectedTemplate, setSelectedTemplate] = useState("active");

    useEffect(() => {
        const fallback = initialScore || Dummies.dummyScore;
        setJsonText(JSON.stringify(fallback, null, 2));
        setParsedScore(fallback);
    }, [initialScore]);

    const handleTextChange = (val) => {
        setJsonText(val);
        try {
            const parsed = JSON.parse(val);
            if (!parsed.notes || !Array.isArray(parsed.notes)) {
                throw new Error("Score layout invalid: 'notes' parameter must be defined as an array schema.");
            }
            setParsedScore(parsed);
            setErrorMsg(null);
        } catch (err) {
            setErrorMsg(err.message);
        }
    };

    const handleTemplateSelect = (e) => {
        const key = e.target.value;
        setSelectedTemplate(key);

        let targetedObj = initialScore;
        if (key !== "active" && Dummies[key]) {
            targetedObj = Dummies[key];
        }

        if (targetedObj) {
            setJsonText(JSON.stringify(targetedObj, null, 2));
            setParsedScore(targetedObj);
            setErrorMsg(null);
        }
    };

    const handleDownloadJson = () => {
        if (errorMsg || !parsedScore) {
            alert("Export aborted: Please fix JSON compilation syntax anomalies before exporting configuration data.");
            return;
        }
        const blob = new Blob([jsonText], { type: 'application/json' });
        const nameClean = (parsedScore.title || "guitalele_composition")
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "_");
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${nameClean}_score.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="w-full min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col gap-6">
            
            {/* Header Control Desktop Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-cyan-400">Interactive Notation Matrix Editor</h2>
                    <p className="text-xs text-slate-400 mt-0.5 font-sans">Modify structural parameters instantly. Real-time updates update the visual matrix.</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <label htmlFor="templateSelector" className="text-xs font-mono font-bold text-slate-400 whitespace-nowrap">
                        BASE SOURCE:
                    </label>
                    <select
                        id="templateSelector"
                        value={selectedTemplate}
                        onChange={handleTemplateSelect}
                        className="bg-slate-950 border border-slate-700 text-slate-200 text-xs font-mono px-3 py-1.5 rounded-lg focus:outline-none focus:border-cyan-500 cursor-pointer"
                    >
                        <option value="active">📍 Currently Active Session Score</option>
                        <option value="dummyScore">Masterpiece Exhibition (4/4)</option>
                        <option value="dummyScore24">2/4 Marching Pattern</option>
                        <option value="dummyScore34">3/4 Waltz Excerpt</option>
                        <option value="dummyScore68">6/8 Arpeggio Flow</option>
                        <option value="dummyScore22">2/2 Cut Time Fanfare</option>
                        <option value="maryHadALittleLamb">Mary Had a Little Lamb</option>
                        <option value="twinkleTwinkleLittleStar">Twinkle Twinkle Little Star</option>
                    </select>
                </div>
            </div>

            {/* Split Dual Layout Configuration */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                
                {/* Left Deck: Structured Input Code Box */}
                <div className="flex flex-col gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg xl:col-span-1">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">JSON Data Matrix Payload</span>
                        {errorMsg ? (
                            <span className="text-[10px] bg-rose-950 border border-rose-800 text-rose-400 px-2 py-0.5 rounded font-mono font-bold animate-pulse">
                                INVALID FORMAT
                            </span>
                        ) : (
                            <span className="text-[10px] bg-emerald-950 border border-emerald-800 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold">
                                COMPILED OK
                            </span>
                        )}
                    </div>

                    <textarea
                        value={jsonText}
                        onChange={(e) => handleTextChange(e.target.value)}
                        className="w-full h-[580px] bg-slate-950 text-emerald-400 font-mono text-xs p-4 rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-600 resize-none shadow-inner leading-relaxed overflow-y-auto"
                        placeholder="Input score array configuration arrays directly here..."
                    />

                    {errorMsg && (
                        <div className="p-3 bg-slate-950 border border-rose-900 rounded-lg">
                            <p className="text-[11px] font-mono font-bold text-rose-400 leading-normal break-words">
                                ⚠️ Syntax Exception: {errorMsg}
                            </p>
                        </div>
                    )}
                </div>

                {/* Right Deck: Render Output Pipeline Display */}
                <div className="xl:col-span-2 w-full">
                    {parsedScore ? (
                        <GuitaleleViewer 
                            scoreData={parsedScore} 
                            editorMode={true}
                            onDownload={handleDownloadJson}
                            onExit={onExit}
                        />
                    ) : (
                        <div className="w-full h-96 border border-dashed border-slate-800 bg-slate-900 rounded-lg flex flex-col items-center justify-center text-center p-6 text-slate-500">
                            <p className="text-sm font-medium">Visualization engine parsing suspended.</p>
                            <p className="text-xs text-slate-600 mt-1 max-w-sm">Fix syntax anomalies highlighted inside the code block desk workspace area to re-initiate graphic outputs.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}