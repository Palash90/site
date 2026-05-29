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

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

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

const getFlagPath = (sx, sy) => {
    const startY = sy + 1;
    return `M ${sx} ${startY} 
            C ${sx + 9} ${startY + 2}, ${sx + 11} ${startY + 12}, ${sx + 1} ${startY + 23} 
            C ${sx + 6} ${startY + 14}, ${sx + 5} ${startY + 7}, ${sx} ${startY + 9} 
            Z`;
};

export default function GuitaleleViewer({ scoreData }) {
    if (!scoreData || !scoreData.notes) return null;

    let rawEvents = [...scoreData.notes];

    // 1. NORMALIZATION: Convert everything into Chord "Events"
    let processedEvents = rawEvents.map((event, index) => {
        let detectedRhythm = event.rhythm;
        
        let pitches = event.pitches || [];
        // Backwards compatibility for monophonic inputs
        if (!event.pitches && event.fret !== undefined && event.string !== undefined) {
            pitches = [{ fret: event.fret, string: event.string }];
        }

        const isRestEvent = pitches.length === 0 && !event.tie;

        if (!detectedRhythm && event.duration !== undefined) {
            if (isRestEvent) {
                if (event.duration === 1.5) detectedRhythm = 'x.';
                else if (event.duration === 1.0) detectedRhythm = 'x';
                else if (event.duration === 0.5) detectedRhythm = 'x+';
                else if (event.duration === 0.25) detectedRhythm = 'x=';
            } else {
                if (event.duration === 6.0) detectedRhythm = 'o.';
                else if (event.duration === 4.0) detectedRhythm = 'o';
                else if (event.duration === 3.0) detectedRhythm = '..';
                else if (event.duration === 2.0) detectedRhythm = '.';
                else if (event.duration === 1.5) detectedRhythm = ':.';
                else if (event.duration === 1.0) detectedRhythm = ':';
                else if (event.duration === 0.75) detectedRhythm = '+.';
                else if (event.duration === 0.5) detectedRhythm = '+';
                else if (event.duration === 0.25) detectedRhythm = '=';
            }
        }

        const beatValue = event.duration !== undefined ? event.duration : (RHYTHM_BEAT_VALUES[detectedRhythm || ':'] || 1.0);

        return {
            ...event,
            pitches, // Guaranteed array of pitches
            globalIndex: index,
            rhythm: detectedRhythm || (isRestEvent ? 'x' : ':'),
            beatValue,
            isRest: isRestEvent || (detectedRhythm && detectedRhythm.startsWith('x'))
        };
    });

    const events = processedEvents.map((ev, idx) => {
        return {
            ...ev,
            isTiedToNext: !!ev.tie,
            isTiedFromPrev: idx > 0 ? !!processedEvents[idx - 1].tie : false
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
    let currentRowEvents = [];
    let accumulatedBeats = 0;
    let measuresInRow = 0;

    const MAX_MEASURES_PER_ROW = 4;
    const MAX_NOTES_PER_ROW = 64;

    // 2. TIMING AND WRAPPING
    events.forEach((ev) => {
        currentRowEvents.push({ ...ev });
        accumulatedBeats += ev.beatValue;

        if (accumulatedBeats >= beatsPerMeasure - 0.05) {
            currentRowEvents[currentRowEvents.length - 1].endOfMeasure = true;
            measuresInRow++;
            accumulatedBeats = Math.max(0, accumulatedBeats - beatsPerMeasure);

            if (measuresInRow >= MAX_MEASURES_PER_ROW || currentRowEvents.length >= MAX_NOTES_PER_ROW) {
                rows.push([...currentRowEvents]);
                currentRowEvents = [];
                measuresInRow = 0;
            }
        } else if (currentRowEvents.length >= MAX_NOTES_PER_ROW) {
            rows.push([...currentRowEvents]);
            currentRowEvents = [];
            measuresInRow = 0;
            accumulatedBeats = 0;
        }
    });

    if (currentRowEvents.length > 0) rows.push([...currentRowEvents]);

    return (
        <div className="w-full h-[85vh] overflow-y-auto bg-stone-100/80 p-6 flex flex-col gap-10 rounded-xl shadow-inner border border-stone-200">
            {rows.map((rowEvents, rowIdx) => {
                const totalWidth = paddingX * 2 + (rowEvents.length * noteSpacing);
                const barlineXPositions = [];
                let rowBeatTracker = 0;

                // 3. PRE-PROCESS RENDER DATA
                const renderedEvents = rowEvents.map((ev, index) => {
                    const cx = paddingX + (index * noteSpacing) + (noteSpacing / 2);
                    rowBeatTracker += ev.beatValue;

                    if (Math.abs(rowBeatTracker % beatsPerMeasure) < 0.01 && index !== rowEvents.length - 1) {
                        barlineXPositions.push(cx + (noteSpacing / 2));
                    }

                    const processedPitches = ev.pitches.map(p => {
                        const tabY = tabTopY + ((p.string - 1) * lineSpacing);
                        const midi = GUITALELE_TUNING[p.string].baseMidi + p.fret;
                        const clef = midi >= 60 ? 'treble' : 'bass';
                        const clefTopY = clef === 'treble' ? trebleTopY : bassTopY;
                        
                        const pitchProps = parsePitchProperties(midi, clef, clefTopY, lineSpacing);
                        
                        return {
                            ...p,
                            tabY,
                            staffY: pitchProps.y,
                            isSharp: pitchProps.isSharp,
                            midi,
                            clef,
                            noteName: `${NOTE_NAMES[midi % 12]}${Math.floor(midi / 12) - 1}`
                        };
                    });

                    return { ...ev, cx, processedPitches };
                });

                return (
                    <div key={`row-${rowIdx}`} className="bg-white border border-stone-200 rounded-lg shadow-sm flex-none p-4 w-full overflow-x-auto">
                        <svg width={totalWidth} height={svgHeight} className="select-none mx-auto block">
                            
                            {/* Staff Background Lines (Same as before) */}
                            <path d={`M ${paddingX - 115} ${trebleTopY} L ${paddingX - 122} ${trebleTopY} L ${paddingX - 122} ${bassTopY + 4 * lineSpacing} L ${paddingX - 115} ${bassTopY + 4 * lineSpacing}`} fill="none" stroke="#64748b" strokeWidth="2.5" />
                            {[0, 1, 2, 3, 4].map((i) => (<line key={`treble-${i}`} x1={paddingX} y1={trebleTopY + i * lineSpacing} x2={totalWidth - paddingX} y2={trebleTopY + i * lineSpacing} stroke="#94a3b8" strokeWidth="1" />))}
                            <text x={paddingX - 105} y={trebleTopY + (3.5 * lineSpacing)} className="text-4xl font-serif fill-slate-800">𝄞</text>
                            {[0, 1, 2, 3, 4].map((i) => (<line key={`bass-${i}`} x1={paddingX} y1={bassTopY + i * lineSpacing} x2={totalWidth - paddingX} y2={bassTopY + i * lineSpacing} stroke="#94a3b8" strokeWidth="1" />))}
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

                            {/* Tab Grid */}
                            {[0, 1, 2, 3, 4, 5].map((i) => (<line key={`t-l-${i}`} x1={paddingX} y1={tabTopY + i * lineSpacing} x2={totalWidth - paddingX} y2={tabTopY + i * lineSpacing} stroke="#cbd5e1" strokeWidth="1.2" />))}
                            <g transform={`translate(${paddingX - 105}, ${tabTopY + 12})`} className="fill-slate-400 font-black tracking-tighter text-xs">
                                <text x="0" y="0">T</text><text x="0" y="14">A</text><text x="0" y="28">B</text>
                            </g>
                            {[0, 1, 2, 3, 4, 5].map((i) => (<text key={`string-${i}`} x={paddingX - 15} y={tabTopY + (i * lineSpacing) + 4} textAnchor="end" className="text-[9px] font-bold fill-slate-400">{i + 1}</text>))}

                            {/* Frames & Barlines */}
                            <line x1={paddingX} y1={trebleTopY} x2={paddingX} y2={bassTopY + 4 * lineSpacing} stroke="#475569" strokeWidth="2" />
                            <line x1={paddingX} y1={tabTopY} x2={paddingX} y2={tabTopY + 5 * lineSpacing} stroke="#64748b" strokeWidth="2" />
                            {barlineXPositions.map((barX, i) => (
                                <g key={`barline-${i}`}>
                                    <line x1={barX} y1={trebleTopY} x2={barX} y2={bassTopY + 4 * lineSpacing} stroke="#475569" strokeWidth="1.6" />
                                    <line x1={barX} y1={tabTopY} x2={barX} y2={tabTopY + 5 * lineSpacing} stroke="#64748b" strokeWidth="1.6" />
                                </g>
                            ))}
                            <line x1={totalWidth - paddingX} y1={trebleTopY} x2={totalWidth - paddingX} y2={bassTopY + 4 * lineSpacing} stroke="#475569" strokeWidth="2" />
                            <line x1={totalWidth - paddingX} y1={tabTopY} x2={totalWidth - paddingX} y2={tabTopY + 5 * lineSpacing} stroke="#64748b" strokeWidth="2" />

                            {/* 4. DYNAMIC CHORD FOREGROUND */}
                            {renderedEvents.map((ev, idx) => {
                                // Calculate stem limits based on highest and lowest notes in the chord
                                const staffYs = ev.processedPitches.map(p => p.staffY);
                                const lowestVisualNoteY = staffYs.length > 0 ? Math.max(...staffYs) : 0;
                                const highestVisualNoteY = staffYs.length > 0 ? Math.min(...staffYs) : 0;
                                const stemTopY = ev.beatValue <= 0.25 ? highestVisualNoteY - 35 : highestVisualNoteY - 28;

                                return (
                                    <g key={`node-${idx}`}>
                                        {/* Hitbox */}
                                        <rect 
                                            x={ev.cx - (noteSpacing / 2)} y={trebleTopY - 15} 
                                            width={noteSpacing} height={rhythmTopY - trebleTopY + 35} 
                                            fill="transparent" pointerEvents="all" className="cursor-help"
                                        />
                                        <title>
                                            {ev.isRest ? `Rest: ${ev.rhythm}` : `Chord/Note | Rhythm: ${ev.rhythm}\n` + 
                                                ev.processedPitches.map(p => `- ${p.noteName} (Fret: ${p.fret}, Str: ${p.string})`).join('\n')}
                                        </title>

                                        {/* Grand Staff Generation */}
                                        {ev.isRest ? (
                                            <g>
                                                {ev.rhythm === 'x' && <path d={`M ${ev.cx - 4} ${trebleTopY + 28} L ${ev.cx + 4} ${trebleTopY + 34} L ${ev.cx - 4} ${trebleTopY + 40} Q ${ev.cx + 6} ${trebleTopY + 44} ${ev.cx} ${trebleTopY + 50}`} fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />}
                                                {ev.rhythm === 'x+' && <path d={`M ${ev.cx - 3} ${trebleTopY + 32} A 3.5 3.5 0 1 1 ${ev.cx + 2} ${trebleTopY + 34} Q ${ev.cx - 2} ${trebleTopY + 38} ${ev.cx + 4} ${trebleTopY + 30} L ${ev.cx - 3} ${trebleTopY + 50}`} fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}
                                                {ev.rhythm === 'x=' && (
                                                    <g>
                                                        <path d={`M ${ev.cx - 2} ${trebleTopY + 27} A 3 3 0 1 1 ${ev.cx + 3} ${trebleTopY + 29} Q ${ev.cx - 1} ${trebleTopY + 33} ${ev.cx + 5} ${trebleTopY + 25}`} fill="none" stroke="#0f172a" strokeWidth="2" />
                                                        <path d={`M ${ev.cx - 4} ${trebleTopY + 36} A 3 3 0 1 1 ${ev.cx + 1} ${trebleTopY + 38} Q ${ev.cx - 3} ${trebleTopY + 42} ${ev.cx + 3} ${trebleTopY + 34} L ${ev.cx - 4} ${trebleTopY + 52}`} fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
                                                    </g>
                                                )}
                                                <rect x={ev.cx - 6} y={tabTopY + (2 * lineSpacing) - 4} width={12} height={16} fill="#ffffff" />
                                                <text x={ev.cx} y={tabTopY + (3 * lineSpacing) - 2} textAnchor="middle" className="text-[10px] font-mono font-bold fill-rose-500 select-none">𝄾</text>
                                            </g>
                                        ) : (
                                            <g>
                                                {/* Iterating over every pitch in the chord */}
                                                {ev.processedPitches.map((pitch, pIdx) => {
                                                    const clefTopY = pitch.clef === 'treble' ? trebleTopY : bassTopY;
                                                    const bottomStaffEdge = clefTopY + (4 * lineSpacing);
                                                    const lowerLedgers = pitch.staffY > bottomStaffEdge ? Math.floor((pitch.staffY - bottomStaffEdge) / lineSpacing) : 0;
                                                    const upperLedgers = pitch.staffY < clefTopY ? Math.floor((clefTopY - pitch.staffY) / lineSpacing) : 0;

                                                    return (
                                                        <g key={`p-${pIdx}`}>
                                                            {pitch.isSharp && <text x={ev.cx + 8} y={pitch.staffY + 5} className="text-base font-normal fill-slate-950 font-serif">♯</text>}

                                                            {/* Ledgers */}
                                                            {Array.from({ length: Math.max(0, upperLedgers) }).map((_, lIdx) => (
                                                                <line key={`up-ledg-${lIdx}`} x1={ev.cx - 10} y1={clefTopY - ((lIdx + 1) * lineSpacing)} x2={ev.cx + 10} y2={clefTopY - ((lIdx + 1) * lineSpacing)} stroke="#475569" strokeWidth="1.2" />
                                                            ))}
                                                            {Array.from({ length: Math.max(0, lowerLedgers) }).map((_, lIdx) => (
                                                                <line key={`low-ledg-${lIdx}`} x1={ev.cx - 10} y1={bottomStaffEdge + ((lIdx + 1) * lineSpacing)} x2={ev.cx + 10} y2={bottomStaffEdge + ((lIdx + 1) * lineSpacing)} stroke="#475569" strokeWidth="1.2" />
                                                            ))}

                                                            {/* Notehead */}
                                                            {ev.beatValue >= 2.0 ? (
                                                                <ellipse cx={ev.cx} cy={pitch.staffY} rx={5.5} ry={4} transform={`rotate(-22 ${ev.cx} ${pitch.staffY})`} fill="#ffffff" stroke="#0f172a" strokeWidth="1.8" />
                                                            ) : (
                                                                <ellipse cx={ev.cx} cy={pitch.staffY} rx={5.5} ry={4} transform={`rotate(-22 ${ev.cx} ${pitch.staffY})`} className="fill-slate-950" />
                                                            )}

                                                            {/* Multi-Tie Logic (Draws ties matching specific strings to the next chord) */}
                                                            {ev.isTiedToNext && renderedEvents[idx + 1] && !renderedEvents[idx + 1].isRest && (
                                                                (() => {
                                                                    const targetPitch = renderedEvents[idx + 1].processedPitches.find(np => np.string === pitch.string);
                                                                    if (targetPitch) {
                                                                        return (
                                                                            <path 
                                                                                d={`M ${ev.cx + 4} ${pitch.staffY + 5} Q ${(ev.cx + renderedEvents[idx + 1].cx) / 2} ${Math.max(pitch.staffY, targetPitch.staffY) + 16} ${renderedEvents[idx + 1].cx - 4} ${targetPitch.staffY + 5}`}
                                                                                fill="none" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round"
                                                                            />
                                                                        );
                                                                    }
                                                                })()
                                                            )}

                                                            {/* Tablature Numbers */}
                                                            <rect x={ev.cx - 7} y={pitch.tabY - 7} width={14} height={14} fill="#ffffff" />
                                                            <text x={ev.cx} y={pitch.tabY + 4} textAnchor="middle" className="text-[11px] font-sans font-bold fill-slate-900">{pitch.fret}</text>
                                                        </g>
                                                    );
                                                })}

                                                {/* Unified Stem & Flag (Drawn ONCE per chord) */}
                                                {ev.beatValue < 4.0 && (
                                                    <line x1={ev.cx + 5} y1={lowestVisualNoteY} x2={ev.cx + 5} y2={stemTopY} stroke="#0f172a" strokeWidth="1.6" />
                                                )}
                                                {[6.0, 3.0, 1.5, 0.75].includes(ev.beatValue) && (
                                                    <circle cx={ev.cx + 12} cy={highestVisualNoteY - 3} r={2} className="fill-slate-950" />
                                                )}
                                                {ev.beatValue === 0.5 && (
                                                    <path d={getFlagPath(ev.cx + 5, stemTopY)} fill="#0f172a" />
                                                )}
                                                {ev.beatValue <= 0.25 && (
                                                    <g>
                                                        <path d={getFlagPath(ev.cx + 5, stemTopY)} fill="#0f172a" />
                                                        <path d={getFlagPath(ev.cx + 5, stemTopY + 10)} fill="#0f172a" />
                                                    </g>
                                                )}
                                            </g>
                                        )}

                                        {/* Rhythm Lane */}
                                        <g>
                                            {ev.isTiedToNext && renderedEvents[idx + 1] && (
                                                <line x1={ev.cx + 12} y1={rhythmTopY - 4} x2={renderedEvents[idx + 1].cx - 12} y2={rhythmTopY - 4} stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
                                            )}
                                            <text x={ev.cx} y={rhythmTopY} textAnchor="middle" className={`font-mono font-black text-sm ${ev.isRest ? 'fill-rose-500' : 'fill-indigo-600'}`}>
                                                {ev.rhythm}
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