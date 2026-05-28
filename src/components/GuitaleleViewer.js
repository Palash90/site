// 1. Static Configuration Matrix
const GUITALELE_TUNING = {
    1: { baseMidi: 69 }, // A4
    2: { baseMidi: 64 }, // E4
    3: { baseMidi: 60 }, // C4 (Middle C)
    4: { baseMidi: 55 }, // G3
    5: { baseMidi: 50 }, // D3
    6: { baseMidi: 45 }  // A2
};

// Updated Rhythm Value Token Table (Supporting Rest Extensions)
const RHYTHM_BEAT_VALUES = {
    'o': 4.0,   // Whole Note
    '.': 2.0,   // Half Note
    ':': 1.0,   // Quarter Note
    '+': 0.5,   // Eighth Note
    '=': 0.25,  // Sixteenth Note
    'x': 1.0,   // Quarter Rest
    'x+': 0.5,  // Eighth Rest
    'x=': 0.25  // Sixteenth Rest
};

const CHROMATIC_MAP = {
    0: [0, false], 1: [0, true], 2: [1, false], 3: [1, true], 4: [2, false],
    5: [3, false], 6: [3, true], 7: [4, false], 8: [4, true], 9: [5, false],
    10: [5, true], 11: [6, false]
};

const parsePitchProperties = (midiNumber, staffTopY, lineSpacing) => {
    const visualAnchorMidi = 52; // E3 reference anchoring the bottom line
    const visualAnchorY = visualAnchorMidi === 52 ? staffTopY + (4 * lineSpacing) : 0;

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

export default function GuitaleleViewer({ scoreData }) {
    if (!scoreData || !scoreData.notes) return null;
    
    let notes = [...scoreData.notes];
    console.log("Original notes order from scoreData:", notes);
    notes = notes.reverse(); // Reverse to render in correct order from left to right

    console.log("Rendering GuitaleleViewer with scoreData:", notes);

    // Layout Canvas Geometry
    const paddingX = 80;
    const noteSpacing = 75;
    const staffTopY = 60;
    const tabTopY = 190;
    const lineSpacing = 14;

    // Clean rhythm baseline alignment below the TAB system
    const rhythmTopY = tabTopY + (5 * lineSpacing) + 32;

    const beatsPerMeasure = parseInt(scoreData.timeSignature?.split('/')[0] || '4', 10);

    let accumulatedBeats = 0;
    const barlineXPositions = [];

    // Pre-process notes track to calculate barlines and structural metrics
    const renderedNotes = notes.map((note, index) => {
        const currentX = paddingX + (index * noteSpacing) + (noteSpacing / 2);
        const beatValue = RHYTHM_BEAT_VALUES[note.rhythm] || 1.0;

        accumulatedBeats += beatValue;
        if (accumulatedBeats % beatsPerMeasure === 0 && index !== notes.length - 1) {
            barlineXPositions.push(currentX + (noteSpacing / 2));
        }

        const isRest = note.rhythm?.startsWith('x');
        let tabY = 0;
        let staffY = staffTopY + (2 * lineSpacing); // Rests center on the B4 middle staff line
        let isSharp = false;
        let midi = 0;

        if (!isRest && note.string && note.fret !== undefined) {
            tabY = tabTopY + ((note.string - 1) * lineSpacing);
            midi = GUITALELE_TUNING[note.string].baseMidi + note.fret;
            const pitchProps = parsePitchProperties(midi, staffTopY, lineSpacing);
            staffY = pitchProps.y;
            isSharp = pitchProps.isSharp;
        }

        return { ...note, midi, cx: currentX, tabY, staffY, isSharp, isRest };
    });

    const totalWidth = paddingX * 2 + (notes.length * noteSpacing);

    return (
        <div className="w-full overflow-x-auto bg-white p-5 border border-slate-200 rounded-xl shadow-sm">
            <svg width={totalWidth} height={340} className="mx-auto select-none">

                {/* ================================================================= */}
                {/* LINE LAYER WORKSPACE DESIGN (STAFF LINES, TAB LINES, BARLINES)    */}
                {/* ================================================================= */}

                {/* 5-Line Musical Staff Grid */}
                {[0, 1, 2, 3, 4].map((i) => (
                    <line
                        key={`s-l-${i}`}
                        x1={paddingX} y1={staffTopY + i * lineSpacing}
                        x2={totalWidth - paddingX} y2={staffTopY + i * lineSpacing}
                        stroke="#94a3b8" strokeWidth="1"
                    />
                ))}
                <text x={paddingX - 45} y={staffTopY + (3.5 * lineSpacing)} className="text-4xl font-serif fill-slate-800">𝄞</text>
                <text x={paddingX - 35} y={staffTopY + (4.9 * lineSpacing)} className="text-[10px] font-sans font-black fill-slate-700">8</text>

                {/* 6-Line Guitalele Tab System */}
                {[0, 1, 2, 3, 4, 5].map((i) => (
                    <line
                        key={`t-l-${i}`}
                        x1={paddingX} y1={tabTopY + i * lineSpacing}
                        x2={totalWidth - paddingX} y2={tabTopY + i * lineSpacing}
                        stroke="#cbd5e1" strokeWidth="1.2"
                    />
                ))}
                <g transform={`translate(${paddingX - 45}, ${tabTopY + 12})`} className="fill-slate-400 font-black tracking-tighter text-xs">
                    <text x="0" y="0">T</text>
                    <text x="0" y="14">A</text>
                    <text x="0" y="28">B</text>
                </g>

                {/* Dynamic Structural Measures Dividing Bars */}
                {barlineXPositions.map((barX, i) => (
                    <g key={`barline-${i}`}>
                        <line x1={barX} y1={staffTopY} x2={barX} y2={staffTopY + 4 * lineSpacing} stroke="#475569" strokeWidth="1.5" />
                        <line x1={barX} y1={tabTopY} x2={barX} y2={tabTopY + 5 * lineSpacing} stroke="#64748b" strokeWidth="1.5" />
                    </g>
                ))}

                {/* Final Outer Sheet Enclosure Borders */}
                <line x1={totalWidth - paddingX} y1={staffTopY} x2={totalWidth - paddingX} y2={staffTopY + 4 * lineSpacing} stroke="#475569" strokeWidth="2" />
                <line x1={totalWidth - paddingX} y1={tabTopY} x2={totalWidth - paddingX} y2={tabTopY + 5 * lineSpacing} stroke="#64748b" strokeWidth="2" />

                {/* String Number Labels (1 to 6) */}
                {[0, 1, 2, 3, 4, 5].map((i) => (
                    <text
                        key={`string-label-${i}`}
                        x={paddingX - 15}
                        y={tabTopY + (i * lineSpacing) + 4}
                        textAnchor="end"
                        className="text-[9px] font-bold fill-slate-400 select-none"
                    >
                        {i + 1}
                    </text>
                ))}

                {/* ================================================================= */}
                {/* RENDER SYSTEM ENGINE: NOTES, CONVERTED REST GLYPHS, RHYTHM LINE */}
                {/* ================================================================= */}
                {renderedNotes.map((note, idx) => {
                    const bottomStaffEdge = staffTopY + (4 * lineSpacing);
                    const ledgerLinesCount = !note.isRest ? Math.floor((note.staffY - bottomStaffEdge) / lineSpacing) : 0;
                    const ledgersArray = Array.from({ length: Math.max(0, ledgerLinesCount) });

                    return (
                        <g key={`node-${idx}`}>

                            {/* --- 1. SHEET MUSIC VIEW RENDERING BLOCK --- */}
                            {note.isRest ? (
                                /* Dynamic Rest Shape Pipeline Router */
                                <g>
                                    {note.rhythm === 'x' && (
                                        /* Quarter Rest: Z-Hook Engraving Shape */
                                        <path
                                            d={`M ${note.cx - 4} ${note.staffY - 10} L ${note.cx + 4} ${note.staffY - 4} L ${note.cx - 4} ${note.staffY + 2} Q ${note.cx + 6} ${note.staffY + 6} ${note.cx} ${note.staffY + 12}`}
                                            fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round"
                                        />
                                    )}
                                    {note.rhythm === 'x+' && (
                                        /* Eighth Rest: Traditional single flag-slash pattern */
                                        <path
                                            d={`M ${note.cx - 3} ${note.staffY - 6} A 3.5 3.5 0 1 1 ${note.cx + 2} ${note.staffY - 4} Q ${note.cx - 2} ${note.staffY} ${note.cx + 4} ${note.staffY - 8} L ${note.cx - 3} ${note.staffY + 12}`}
                                            fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                        />
                                    )}
                                    {note.rhythm === 'x=' && (
                                        /* Sixteenth Rest: Double stacked flags pattern */
                                        <g>
                                            {/* Top Flag Hook */}
                                            <path
                                                d={`M ${note.cx - 2} ${note.staffY - 11} A 3 3 0 1 1 ${note.cx + 3} ${note.staffY - 9} Q ${note.cx - 1} ${note.staffY - 5} ${note.cx + 5} ${note.staffY - 13}`}
                                                fill="none" stroke="#0f172a" strokeWidth="2"
                                            />
                                            {/* Bottom Flag Hook & Long Ground Slash */}
                                            <path
                                                d={`M ${note.cx - 4} ${note.staffY - 2} A 3 3 0 1 1 ${note.cx + 1} ${note.staffY} Q ${note.cx - 3} ${note.staffY + 4} ${note.cx + 3} ${note.staffY - 4} L ${note.cx - 4} ${note.staffY + 14}`}
                                                fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round"
                                            />
                                        </g>
                                    )}
                                </g>
                            ) : (
                                /* Standard Pitch Head & Stem Architecture */
                                <g>
                                    {note.isSharp && (
                                        <text x={note.cx - 15} y={note.staffY + 5} className="text-sm font-bold fill-slate-900 font-serif">♯</text>
                                    )}

                                    {/* Upper Ledger Lines (above the staff) */}
                                    {note.staffY < staffTopY && Array.from({
                                        length: Math.ceil((staffTopY - note.staffY) / lineSpacing)
                                    }).map((_, lIdx) => {
                                        const ledgerY = staffTopY - ((lIdx + 1) * lineSpacing);
                                        return (
                                            <line
                                                key={`ledger-upper-${idx}-${lIdx}`}
                                                x1={note.cx - 10} y1={ledgerY} x2={note.cx + 10} y2={ledgerY}
                                                stroke="#475569" strokeWidth="1.2"
                                            />
                                        );
                                    })}

                                    {/* Lower Ledger Lines (below the staff) */}
                                    {ledgersArray.map((_, lIdx) => {
                                        const ledgerY = bottomStaffEdge + ((lIdx + 1) * lineSpacing);
                                        return (
                                            <line
                                                key={`ledger-lower-${idx}-${lIdx}`}
                                                x1={note.cx - 10} y1={ledgerY} x2={note.cx + 10} y2={ledgerY}
                                                stroke="#475569" strokeWidth="1.2"
                                            />
                                        );
                                    })}

                                    <ellipse
                                        cx={note.cx} cy={note.staffY} rx={5.5} ry={4}
                                        transform={`rotate(-22 ${note.cx} ${note.staffY})`} className="fill-slate-950"
                                    />

                                    <line
                                        x1={note.cx + 5} y1={note.staffY} x2={note.cx + 5} y2={note.staffY - 26}
                                        stroke="#0f172a" strokeWidth="1.5"
                                    />

                                    {note.tie && renderedNotes[idx + 1] && !renderedNotes[idx + 1].isRest && (
                                        <path
                                            d={`M ${note.cx + 4} ${note.staffY + 6} Q ${note.cx + (noteSpacing / 2)} ${((note.staffY + renderedNotes[idx + 1].staffY) / 2) + 14} ${note.cx + noteSpacing - 4} ${renderedNotes[idx + 1].staffY + 6}`}
                                            fill="none" stroke="#64748b" strokeWidth="1.2" strokeDasharray="3,2"
                                        />
                                    )}
                                </g>
                            )}


                            {/* --- 2. TABLATURE VIEW RENDERING BLOCK --- */}
                            {!note.isRest && (
                                <g>
                                    <rect x={note.cx - 7} y={note.tabY - 7} width={14} height={14} fill="#ffffff" />
                                    <text x={note.cx} y={note.tabY + 4} textAnchor="middle" className="text-[11px] font-sans font-bold fill-slate-900">
                                        {note.fret}
                                    </text>
                                </g>
                            )}


                            {/* --- 3. CUSTOM TRACKER RHYTHM NOTATION BLOCK --- */}
                            <g>
                                {/* Visual line link displaying ties horizontally */}
                                {note.tie && renderedNotes[idx + 1] && (
                                    <line
                                        x1={note.cx + 12} y1={rhythmTopY - 2}
                                        x2={note.cx + noteSpacing - 12} y2={rhythmTopY - 2}
                                        stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="2,1"
                                    />
                                )}

                                {/* Notation Token Printer */}
                                <text
                                    x={note.cx}
                                    y={rhythmTopY}
                                    textAnchor="middle"
                                    className={`font-mono font-bold text-sm ${note.isRest ? 'fill-rose-500' : 'fill-indigo-600'}`}
                                >
                                    {/* Substitutes character with continuous tracking fill line if inside a tie chain */}
                                    {note.tie && idx > 0 && renderedNotes[idx - 1].tie ? '—' : note.rhythm}
                                </text>
                            </g>

                        </g>
                    );
                })}
            </svg>
        </div>
    );
}