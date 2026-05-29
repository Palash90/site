import React, { useState, useEffect, useMemo } from 'react';
import GuitaleleViewer from './GuitaleleViewer';
import * as Dummies from './dummy_score';

const RHYTHM_BEAT_VALUES = {
    'o': 4.0, 'o.': 6.0, '.': 2.0, '..': 3.0, ':': 1.0, ':.': 1.5, '+': 0.5, '+.': 0.75, '=': 0.25,
    'x': 1.0, 'x.': 1.5, 'x+': 0.5, 'x=': 0.25
};

const SUPPORTED_TIME_SIGNATURE_TOPS = [2, 3, 4, 5, 6, 7, 8, 9, 12];
const SUPPORTED_TIME_SIGNATURE_BOTTOMS = [2, 4, 8, 16];

const getBeatValue = (note) => {
    if (note.duration !== undefined) return note.duration;
    return RHYTHM_BEAT_VALUES[note.rhythm || ':'] || 1.0;
};

const formatBeatCount = (value) => Number.parseFloat(value.toFixed(3)).toString();

const validateMeasures = (score) => {
    if (!score?.notes?.length) return [];

    const [rawTop = '4', rawBottom = '4'] = (score.timeSignature || '4/4').split('/');
    const beatsPerMeasure = parseInt(rawTop, 10);
    const beatUnit = parseInt(rawBottom, 10);

    if (!Number.isFinite(beatsPerMeasure) || !Number.isFinite(beatUnit) || beatsPerMeasure <= 0 || beatUnit <= 0) {
        return [{ measureNumber: null, message: "Time signature must start with a positive beat count." }];
    }

    const errors = [];
    if (!SUPPORTED_TIME_SIGNATURE_TOPS.includes(beatsPerMeasure) || !SUPPORTED_TIME_SIGNATURE_BOTTOMS.includes(beatUnit)) {
        errors.push({
            measureNumber: null,
            message: `Unsupported time signature ${score.timeSignature}. Use ${SUPPORTED_TIME_SIGNATURE_TOPS.join(", ")} over ${SUPPORTED_TIME_SIGNATURE_BOTTOMS.join(", ")}.`
        });
    }

    let measureNumber = 1;
    let accumulatedBeats = 0;
    const epsilon = 0.001;

    score.notes.forEach((note) => {
        accumulatedBeats += getBeatValue(note);
        if (Math.abs(accumulatedBeats - beatsPerMeasure) <= epsilon) {
            accumulatedBeats = 0;
            measureNumber++;
        } else if (accumulatedBeats > beatsPerMeasure + epsilon) {
            errors.push({
                measureNumber,
                type: "overfull",
                message: `Measure ${measureNumber}: ${formatBeatCount(accumulatedBeats)} beats, expected ${beatsPerMeasure}.`
            });
            accumulatedBeats = 0;
            measureNumber++;
        }
    });

    if (accumulatedBeats > epsilon) {
        errors.push({
            measureNumber,
            type: "underfull",
            missingBeats: beatsPerMeasure - accumulatedBeats,
            message: `Measure ${measureNumber}: ${formatBeatCount(accumulatedBeats)} beats, expected ${beatsPerMeasure}.`
        });
    }

    return errors;
};

export default function TabEditor({ initialScore, onExit }) {
    const [parsedScore, setParsedScore] = useState(null);
    const [selectedTemplate, setSelectedTemplate] = useState("active");
    const [hasChanges, setHasChanges] = useState(false);
    const [isCurrentScoreDownloaded, setIsCurrentScoreDownloaded] = useState(false);

    useEffect(() => {
        const fallback = initialScore || Dummies.dummyScore;
        setParsedScore(fallback);
        setHasChanges(false);
        setIsCurrentScoreDownloaded(false);
    }, [initialScore]);

    const measureErrors = useMemo(() => validateMeasures(parsedScore), [parsedScore]);

    const handleTemplateSelect = (e) => {
        const key = e.target.value;
        setSelectedTemplate(key);

        let targetedObj = initialScore;
        if (key !== "active" && Dummies[key]) {
            targetedObj = Dummies[key];
        }

        if (targetedObj) {
            setParsedScore(targetedObj);
            setHasChanges(true);
            setIsCurrentScoreDownloaded(false);
        }
    };

    const handleDownloadJson = () => {
        if (!parsedScore) {
            alert("Export aborted: No score is loaded.");
            return;
        }
        if (measureErrors.length > 0) {
            alert("Export aborted: Fix measure beat counts before downloading the score.");
            return;
        }
        const blob = new Blob([JSON.stringify(parsedScore, null, 2)], { type: 'application/json' });
        const nameClean = (parsedScore.title || "guitalele_composition")
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "_");
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${nameClean}_score.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsCurrentScoreDownloaded(true);
    };

    const handleViewerScoreChange = (nextScore) => {
        setParsedScore(nextScore);
        setHasChanges(true);
        setIsCurrentScoreDownloaded(false);
    };

    const handleExit = () => {
        if (hasChanges && !isCurrentScoreDownloaded) {
            const shouldExit = window.confirm("The score is not downloaded. If you exit now, the data will be lost.");
            if (!shouldExit) return;
        }
        onExit();
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

            <div className="w-full">
                {parsedScore ? (
                    <GuitaleleViewer
                        scoreData={parsedScore}
                        editorMode={true}
                        onScoreChange={handleViewerScoreChange}
                        onDownload={handleDownloadJson}
                        downloadDisabled={measureErrors.length > 0}
                        measureErrors={measureErrors}
                        onExit={handleExit}
                    />
                ) : (
                    <div className="w-full h-96 border border-dashed border-slate-800 bg-slate-900 rounded-lg flex flex-col items-center justify-center text-center p-6 text-slate-500">
                        <p className="text-sm font-medium">Visualization engine parsing suspended.</p>
                        <p className="text-xs text-slate-600 mt-1 max-w-sm">Fix score data to re-initiate graphic outputs.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
