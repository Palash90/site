import React from 'react';

// 1. Static Configuration Matrix
const GUITALELE_TUNING = {
    1: { baseMidi: 69 }, // A4
    2: { baseMidi: 64 }, // E4
    3: { baseMidi: 60 }, // C4 (Middle C)
    4: { baseMidi: 55 }, // G3
    5: { baseMidi: 50 }, // D3
    6: { baseMidi: 45 }  // A2
};

const RHYTHM_BEAT_VALUES = {
    'o': 4.0, 'o.': 6.0, '.': 2.0, '..': 3.0, ':': 1.0, ':.': 1.5, '+': 0.5, '+.': 0.75, '=': 0.25,
    'x': 1.0, 'x.': 1.5, 'x+': 0.5, 'x=': 0.25
};

const CHROMATIC_MAP = {
    0: [0, false], 1: [0, true], 2: [1, false], 3: [1, true], 4: [2, false],
    5: [3, false], 6: [3, true], 7: [4, false], 8: [4, true], 9: [5, false],
    10: [5, true], 11: [6, false]
};

const parsePitchProperties = (midiNumber, clef, clefTopY, lineSpacing) => {
    const visualAnchorMidi = clef === 'treble' ? 64 : 43;
    const visualAnchorY = clefTopY + (4 * lineSpacing);

    const getDiatonicAbsoluteStep = (midi) => {
        const pitchClass = midi % 12;
        const octave = Math.floor(midi / 12);
        const [step] = CHROMATIC_MAP[pitchClass];
        return (octave * 7) + step;
    };

    const currentStep = getDiatonicAbsoluteStep(midiNumber);
    const anchorStep = getDiatonicAbsoluteStep(visualAnchorMidi);
    const stepDiff = currentStep - anchorStep;

    return {
        y: visualAnchorY - (stepDiff * (lineSpacing / 2)),
        isSharp: CHROMATIC_MAP[midiNumber % 12][1]
    };
};

// Helper: Generates a slimmer, more elegant music flag
const getFlagPath = (sx, sy) => {
    const startY = sy + 1; // Subtle drop from the absolute tip

    // Adjusted curves for a thinner, more calligraphic swoop
    return `M ${sx} ${startY} 
            C ${sx + 9} ${startY + 2}, ${sx + 11} ${startY + 12}, ${sx + 1} ${startY + 23} 
            C ${sx + 6} ${startY + 14}, ${sx + 5} ${startY + 7}, ${sx} ${startY + 9} 
            Z`;
};

export default function GuitaleleViewer({ scoreData }) {
    if (!scoreData || !scoreData.notes) return null;

    let rawNotes = [...scoreData.notes];

    let processedNotes = rawNotes.map((note, index) => {
        let detectedRhythm = note.rhythm;

        if (!detectedRhythm && note.duration !== undefined) {
            if (note.fret === undefined && note.string === undefined) {
                if (note.duration === 1.5) detectedRhythm = 'x.';
                else if (note.duration === 1.0) detectedRhythm = 'x';
                else if (note.duration === 0.5) detectedRhythm = 'x+';
                else if (note.duration === 0.25) detectedRhythm = 'x=';
            } else {
                if (note.duration === 4.0) detectedRhythm = 'o';
                else if (note.duration === 3.0) detectedRhythm = '..';
                else if (note.duration === 2.0) detectedRhythm = '.';
                else if (note.duration === 1.5) detectedRhythm = ':.';
                else if (note.duration === 1.0) detectedRhythm = ':';
                else if (note.duration === 0.75) detectedRhythm = '+.';
                else if (note.duration === 0.5) detectedRhythm = '+';
                else if (note.duration === 0.25) detectedRhythm = '=';
            }
        }

        const beatValue = note.duration !== undefined ? note.duration : (RHYTHM_BEAT_VALUES[detectedRhythm || ':'] || 1.0);

        return {
            ...note,
            globalIndex: index, // Track true structural sequence positioning
            rhythm: detectedRhythm || ':',
            beatValue
        };
    });

    // Run a quick explicit forward/backward structural map pass to flag tie configurations globally
    const notes = processedNotes.map((note, idx) => {
        return {
            ...note,
            isTiedToNext: !!note.tie,
            isTiedFromPrev: idx > 0 ? !!processedNotes[idx - 1].tie : false
        };
    });

    const paddingX = 140;
    const noteSpacing = 75;
    const lineSpacing = 14;

    const trebleTopY = 70;
    const bassTopY = 150;
    const tabTopY = 250;
    const rhythmTopY = 350;
    const svgHeight = 390;

    const timeSigTop = scoreData.timeSignature?.split('/')[0] || '4';
    const timeSigBottom = scoreData.timeSignature?.split('/')[1] || '4';
    const beatsPerMeasure = parseInt(timeSigTop, 10);

    let rows = [];
    let currentRowNotes = [];
    let accumulatedBeats = 0;
    let measuresInRow = 0;

    const MAX_MEASURES_PER_ROW = 4;
    const MAX_NOTES_PER_ROW = 64;

    notes.forEach((note) => {
        currentRowNotes.push({ ...note });
        accumulatedBeats += note.beatValue;

        if (accumulatedBeats >= beatsPerMeasure - 0.05) {
            currentRowNotes[currentRowNotes.length - 1].endOfMeasure = true;
            measuresInRow++;

            accumulatedBeats = Math.max(0, accumulatedBeats - beatsPerMeasure);

            if (measuresInRow >= MAX_MEASURES_PER_ROW || currentRowNotes.length >= MAX_NOTES_PER_ROW) {
                rows.push([...currentRowNotes]);
                currentRowNotes = [];
                measuresInRow = 0;
            }
        } else if (currentRowNotes.length >= MAX_NOTES_PER_ROW) {
            rows.push([...currentRowNotes]);
            currentRowNotes = [];
            measuresInRow = 0;
            accumulatedBeats = 0;
        }
    });

    if (currentRowNotes.length > 0) rows.push([...currentRowNotes]);

    return (
        <div className="w-full h-[85vh] overflow-y-auto bg-stone-100/80 p-6 flex flex-col gap-10 rounded-xl shadow-inner border border-stone-200">
            {rows.map((rowNotes, rowIdx) => {
                const totalWidth = paddingX * 2 + (rowNotes.length * noteSpacing);
                const barlineXPositions = [];

                let rowBeatTracker = 0;
                const renderedNotes = rowNotes.map((note, index) => {
                    const cx = paddingX + (index * noteSpacing) + (noteSpacing / 2);

                    rowBeatTracker += note.beatValue;

                    if (Math.abs(rowBeatTracker % beatsPerMeasure) < 0.01 && index !== rowNotes.length - 1) {
                        barlineXPositions.push(cx + (noteSpacing / 2));
                    }

                    const isRest = note.rhythm?.startsWith('x');
                    let tabY = 0, staffY = trebleTopY + (2 * lineSpacing);
                    let isSharp = false, midi = 0, clef = 'treble';

                    if (!isRest && note.string && note.fret !== undefined) {
                        tabY = tabTopY + ((note.string - 1) * lineSpacing);
                        midi = GUITALELE_TUNING[note.string].baseMidi + note.fret;

                        clef = midi >= 60 ? 'treble' : 'bass';
                        const clefTopY = clef === 'treble' ? trebleTopY : bassTopY;

                        const pitchProps = parsePitchProperties(midi, clef, clefTopY, lineSpacing);
                        staffY = pitchProps.y;
                        isSharp = pitchProps.isSharp;
                    }

                    return { ...note, midi, clef, cx, tabY, staffY, isSharp, isRest };
                });

                return (
                    <div key={`row-${rowIdx}`} className="bg-white border border-stone-200 rounded-lg shadow-sm flex-none p-4 w-full overflow-x-auto">
                        <svg width={totalWidth} height={svgHeight} className="select-none mx-auto block">

                            {/* Grand Staff Connecting Brace */}
                            <path
                                d={`M ${paddingX - 115} ${trebleTopY} L ${paddingX - 122} ${trebleTopY} L ${paddingX - 122} ${bassTopY + 4 * lineSpacing} L ${paddingX - 115} ${bassTopY + 4 * lineSpacing}`}
                                fill="none" stroke="#64748b" strokeWidth="2.5"
                            />

                            {/* Treble Stave Grid */}
                            {[0, 1, 2, 3, 4].map((i) => (
                                <line key={`treble-${i}`} x1={paddingX} y1={trebleTopY + i * lineSpacing} x2={totalWidth - paddingX} y2={trebleTopY + i * lineSpacing} stroke="#94a3b8" strokeWidth="1" />
                            ))}
                            <text x={paddingX - 105} y={trebleTopY + (3.5 * lineSpacing)} className="text-4xl font-serif fill-slate-800">𝄞</text>

                            {/* Bass Stave Grid */}
                            {[0, 1, 2, 3, 4].map((i) => (
                                <line key={`bass-${i}`} x1={paddingX} y1={bassTopY + i * lineSpacing} x2={totalWidth - paddingX} y2={bassTopY + i * lineSpacing} stroke="#94a3b8" strokeWidth="1" />
                            ))}
                            <text x={paddingX - 105} y={bassTopY + (3.2 * lineSpacing)} className="text-4xl font-serif fill-slate-800">𝄢</text>

                            {/* Time Signature Engine */}
                            <g className="font-serif font-black text-2xl fill-slate-900 text-center" transform={`translate(${paddingX - 55}, 0)`}>
                                <text x="0" y={trebleTopY + 16} textAnchor="middle">{timeSigTop}</text>
                                <text x="0" y={trebleTopY + 42} textAnchor="middle">{timeSigBottom}</text>

                                <text x="0" y={bassTopY + 16} textAnchor="middle">{timeSigTop}</text>
                                <text x="0" y={bassTopY + 42} textAnchor="middle">{timeSigBottom}</text>

                                <text x="0" y={tabTopY + 24} textAnchor="middle" className="text-xl font-sans font-bold fill-slate-600">{timeSigTop}</text>
                                <text x="0" y={tabTopY + 54} textAnchor="middle" className="text-xl font-sans font-bold fill-slate-600">{timeSigBottom}</text>
                            </g>

                            {/* 6-Line Guitalele Tab Grid */}
                            {[0, 1, 2, 3, 4, 5].map((i) => (
                                <line key={`t-l-${i}`} x1={paddingX} y1={tabTopY + i * lineSpacing} x2={totalWidth - paddingX} y2={tabTopY + i * lineSpacing} stroke="#cbd5e1" strokeWidth="1.2" />
                            ))}
                            <g transform={`translate(${paddingX - 105}, ${tabTopY + 12})`} className="fill-slate-400 font-black tracking-tighter text-xs">
                                <text x="0" y="0">T</text><text x="0" y="14">A</text><text x="0" y="28">B</text>
                            </g>
                            {[0, 1, 2, 3, 4, 5].map((i) => (
                                <text key={`string-${i}`} x={paddingX - 15} y={tabTopY + (i * lineSpacing) + 4} textAnchor="end" className="text-[9px] font-bold fill-slate-400">{i + 1}</text>
                            ))}

                            {/* Start Frame Closures */}
                            <line x1={paddingX} y1={trebleTopY} x2={paddingX} y2={bassTopY + 4 * lineSpacing} stroke="#475569" strokeWidth="2" />
                            <line x1={paddingX} y1={tabTopY} x2={paddingX} y2={tabTopY + 5 * lineSpacing} stroke="#64748b" strokeWidth="2" />

                            {/* Structural Measure Barlines */}
                            {barlineXPositions.map((barX, i) => (
                                <g key={`barline-${i}`}>
                                    <line x1={barX} y1={trebleTopY} x2={barX} y2={bassTopY + 4 * lineSpacing} stroke="#475569" strokeWidth="1.6" />
                                    <line x1={barX} y1={tabTopY} x2={barX} y2={tabTopY + 5 * lineSpacing} stroke="#64748b" strokeWidth="1.6" />
                                </g>
                            ))}

                            {/* End Frame Closures */}
                            <line x1={totalWidth - paddingX} y1={trebleTopY} x2={totalWidth - paddingX} y2={bassTopY + 4 * lineSpacing} stroke="#475569" strokeWidth="2" />
                            <line x1={totalWidth - paddingX} y1={tabTopY} x2={totalWidth - paddingX} y2={tabTopY + 5 * lineSpacing} stroke="#64748b" strokeWidth="2" />

                            {/* Foreground Notation Elements */}
                            {renderedNotes.map((note, idx) => {
                                const clefTopY = note.clef === 'treble' ? trebleTopY : bassTopY;
                                const bottomStaffEdge = clefTopY + (4 * lineSpacing);

                                const lowerLedgers = !note.isRest && note.staffY > bottomStaffEdge ? Math.floor((note.staffY - bottomStaffEdge) / lineSpacing) : 0;
                                const upperLedgers = !note.isRest && note.staffY < clefTopY ? Math.floor((clefTopY - note.staffY) / lineSpacing) : 0;

                                const stemTopY = note.beatValue <= 0.25 ? note.staffY - 35 : note.staffY - 28;

                                return (
                                    <g key={`node-${idx}`}>

                                        {/* --- 1. GRAND STAFF NOTATION --- */}
                                        {note.isRest ? (
                                            <g>
                                                {note.rhythm === 'x' && <path d={`M ${note.cx - 4} ${note.staffY - 10} L ${note.cx + 4} ${note.staffY - 4} L ${note.cx - 4} ${note.staffY + 2} Q ${note.cx + 6} ${note.staffY + 6} ${note.cx} ${note.staffY + 12}`} fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />}
                                                {note.rhythm === 'x+' && <path d={`M ${note.cx - 3} ${note.staffY - 6} A 3.5 3.5 0 1 1 ${note.cx + 2} ${note.staffY - 4} Q ${note.cx - 2} ${note.staffY} ${note.cx + 4} ${note.staffY - 8} L ${note.cx - 3} ${note.staffY + 12}`} fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}
                                                {note.rhythm === 'x=' && (
                                                    <g>
                                                        <path d={`M ${note.cx - 2} ${note.staffY - 11} A 3 3 0 1 1 ${note.cx + 3} ${note.staffY - 9} Q ${note.cx - 1} ${note.staffY - 5} ${note.cx + 5} ${note.staffY - 13}`} fill="none" stroke="#0f172a" strokeWidth="2" />
                                                        <path d={`M ${note.cx - 4} ${note.staffY - 2} A 3 3 0 1 1 ${note.cx + 1} ${note.staffY} Q ${note.cx - 3} ${note.staffY + 4} ${note.cx + 3} ${note.staffY - 4} L ${note.cx - 4} ${note.staffY + 14}`} fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
                                                    </g>
                                                )}
                                            </g>
                                        ) : (
                                            <g>
                                                {/* FIX 1: Sharp sign moved cleanly BEFORE the notehead (-22px) */}
                                                {note.isSharp && <text x={note.cx + 18} y={note.staffY + 3} className="text-base font-normal fill-slate-950 font-serif">♯</text>}

                                                {/* Ledger Lines */}
                                                {Array.from({ length: Math.max(0, upperLedgers) }).map((_, lIdx) => (
                                                    <line key={`up-ledg-${lIdx}`} x1={note.cx - 10} y1={clefTopY - ((lIdx + 1) * lineSpacing)} x2={note.cx + 10} y2={clefTopY - ((lIdx + 1) * lineSpacing)} stroke="#475569" strokeWidth="1.2" />
                                                ))}
                                                {Array.from({ length: Math.max(0, lowerLedgers) }).map((_, lIdx) => (
                                                    <line key={`low-ledg-${lIdx}`} x1={note.cx - 10} y1={bottomStaffEdge + ((lIdx + 1) * lineSpacing)} x2={note.cx + 10} y2={bottomStaffEdge + ((lIdx + 1) * lineSpacing)} stroke="#475569" strokeWidth="1.2" />
                                                ))}

                                                {/* Notehead */}
                                                {note.beatValue >= 2.0 ? (
                                                    <ellipse cx={note.cx} cy={note.staffY} rx={5.5} ry={4} transform={`rotate(-22 ${note.cx} ${note.staffY})`} fill="#ffffff" stroke="#0f172a" strokeWidth="1.8" />
                                                ) : (
                                                    <ellipse cx={note.cx} cy={note.staffY} rx={5.5} ry={4} transform={`rotate(-22 ${note.cx} ${note.staffY})`} className="fill-slate-950" />
                                                )}

                                                {/* Rhythm Dot */}
                                                {[6.0, 3.0, 1.5, 0.75].includes(note.beatValue) && (
                                                    <circle cx={note.cx + 12} cy={note.staffY - 3} r={2} className="fill-slate-950" />
                                                )}

                                                {/* Up-pointing Stem */}
                                                {note.beatValue < 4.0 && (
                                                    <line x1={note.cx + 5} y1={note.staffY} x2={note.cx + 5} y2={stemTopY} stroke="#0f172a" strokeWidth="1.6" />
                                                )}

                                                {/* 8TH NOTE FLAG */}
                                                {note.beatValue === 0.5 && (
                                                    <path d={getFlagPath(note.cx + 5, stemTopY)} fill="#0f172a" />
                                                )}

                                                {/* 16TH NOTE FLAGS */}
                                                {note.beatValue <= 0.25 && (
                                                    <g>
                                                        <path d={getFlagPath(note.cx + 5, stemTopY)} fill="#0f172a" />
                                                        <path d={getFlagPath(note.cx + 5, stemTopY + 10)} fill="#0f172a" />
                                                    </g>
                                                )}
                                            </g>
                                        )}

                                        {/* --- 2. TABLATURE ENGINE --- */}
                                        {note.isRest ? (
                                            <g>
                                                <rect x={note.cx - 6} y={tabTopY + (2 * lineSpacing) - 4} width={12} height={16} fill="#ffffff" />
                                                <text x={note.cx} y={tabTopY + (3 * lineSpacing) - 2} textAnchor="middle" className="text-[10px] font-mono font-bold fill-rose-500 select-none">𝄾</text>
                                            </g>
                                        ) : (
                                            <g>


                                                <rect x={note.cx - 7} y={note.tabY - 7} width={14} height={14} fill="#ffffff" />
                                                <text x={note.cx} y={note.tabY + 4} textAnchor="middle" className="text-[11px] font-sans font-bold fill-slate-900">{note.fret}</text>
                                            </g>
                                        )}

                                        {/* --- 3. CUSTOM RHYTHM NOTATION LANE --- */}
                                        <g>
                                            {/* 1. Draw the solid bridge line if this note is tied to the next one */}
                                            {note.isTiedToNext && renderedNotes[idx + 1] && (
                                                <line
                                                    x1={note.cx + 12}
                                                    y1={rhythmTopY - 4}
                                                    x2={renderedNotes[idx + 1].cx - 12}
                                                    y2={rhythmTopY - 4}
                                                    stroke="#94a3b8"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                />
                                            )}

                                            {/* 2. ALWAYS show the rhythm symbol, tied or not */}
                                            <text
                                                x={note.cx}
                                                y={rhythmTopY}
                                                textAnchor="middle"
                                                className={`font-mono font-black text-sm ${note.isRest ? 'fill-rose-500' : 'fill-indigo-600'}`}
                                            >
                                                {note.rhythm}
                                            </text>
                                        </g>

                                    </g>
                                );
                            })}
                        </svg>
                    </div>
                );
            })}
        </div>
    );
}