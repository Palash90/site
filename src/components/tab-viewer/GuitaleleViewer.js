import React, { useState, useMemo, useRef, useEffect } from 'react';

// --- Static Configuration Matrix ---
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

const DARK_THEME = {
    bgPage: "bg-slate-950",
    bgScore: "bg-slate-900",
    borderScore: "border-slate-800",
    textClef: "#77abc0",
    textTimeSig: "#6fe0d7",
    lineStaff: "#8d6818",
    lineBar: "#c79322",
    lineTab: "#64748b",
    textTabLabel: "#9ac0f5",
    textTabString: "#64748b",
    bgTabRect: "#142a5a96",
    textTabNumber: "#f1f5f9",
    lineStem: "#418cee",
    fillNote: "#568fda",
    fillRest: "#fb7185",
    textRhythm: "#a5b4fc",
    lineTie: "#cbd5e1",
    fillHoverHighlight: "rgba(65, 77, 94, 0.45)",
    fillNoteHover: "#67e8f9",
    strokeNoteHover: "#67e8f9",
    textTabNumberHover: "#a5f3fc",
    textRhythmHover: "#a5f3fc",
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

// Ultra-clean, modern geometric linear slash flags to entirely prevent cluster congestion
const getFlagPath = (sx, sy, isDown = false, isDouble = false) => {
    const drawSlashSegment = (yOffset) => {
        const sY = sy + yOffset;
        if (isDown) {
            // Stem goes down: Flag slants gracefully up-right back toward the center staff lanes
            return `M ${sx} ${sY} L ${sx + 7} ${sY - 8} L ${sx + 7} ${sY - 5} L ${sx} ${sY + 3} Z`;
        }
        // Stem goes up: Flag slants down-right back toward the center staff lanes
        return `M ${sx} ${sY} L ${sx + 7} ${sY + 8} L ${sx + 7} ${sY + 5} L ${sx} ${sY - 3} Z`;
    };

    if (isDouble) {
        // Stack secondary 16th flag beautifully along the stem axis with perfect tracking symmetry
        return drawSlashSegment(0) + " " + drawSlashSegment(isDown ? -5 : 5);
    }
    return drawSlashSegment(0);
};

// --- Advanced Guitalele Acoustic Nylon Synthesis Engine ---
const playHumanizedGuitaleleNote = (ctx, midi, startTime, duration, velocity = 1.0) => {
    const fundamental = 440 * Math.pow(2, (midi - 69) / 12);

    // Master gain for the note
    const mainGain = ctx.createGain();
    mainGain.connect(ctx.destination);

    // Guitalele Nylon Decay Envelope
    const attackTime = 0.012; // Fleshy finger attack (slower than a plastic pick)
    const decayTime = Math.max(duration * 1.2, 2.0);

    mainGain.gain.setValueAtTime(0, startTime);
    mainGain.gain.linearRampToValueAtTime(velocity * 0.8, startTime + attackTime);
    mainGain.gain.exponentialRampToValueAtTime(0.001, startTime + decayTime);

    // 1. The Core String (Triangle wave provides a warm, hollow tone perfect for nylon)
    const stringOsc = ctx.createOscillator();
    stringOsc.type = 'triangle';
    stringOsc.frequency.value = fundamental;

    // 2. The Overtones (Subdued sine wave for slight string resonance)
    const overtoneOsc = ctx.createOscillator();
    overtoneOsc.type = 'sine';
    overtoneOsc.frequency.value = fundamental * 2;
    const overtoneGain = ctx.createGain();
    overtoneGain.gain.value = 0.15; // Kept low to avoid the "piano/bell" sound
    overtoneOsc.connect(overtoneGain);

    // 3. Nylon Dulling Filter (Crucial for the acoustic guitar sound)
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    // The string starts bright when plucked but immediately dulls out
    filter.frequency.setValueAtTime(fundamental * 4, startTime);
    filter.frequency.exponentialRampToValueAtTime(fundamental, startTime + 0.4);

    // 4. The Finger Pluck Transient (Thump/Snap)
    const pluckOsc = ctx.createOscillator();
    pluckOsc.type = 'sine';
    pluckOsc.frequency.setValueAtTime(fundamental * 2.5, startTime);
    pluckOsc.frequency.exponentialRampToValueAtTime(fundamental, startTime + 0.03);

    const pluckGain = ctx.createGain();
    pluckGain.gain.setValueAtTime(0, startTime);
    pluckGain.gain.linearRampToValueAtTime(velocity * 0.3, startTime + 0.005);
    pluckGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.03);

    // Routing
    pluckOsc.connect(pluckGain);
    pluckGain.connect(mainGain);

    stringOsc.connect(filter);
    overtoneGain.connect(filter);
    filter.connect(mainGain);

    // Trigger Timeline
    stringOsc.start(startTime);
    overtoneOsc.start(startTime);
    pluckOsc.start(startTime);

    stringOsc.stop(startTime + decayTime);
    overtoneOsc.stop(startTime + decayTime);
    pluckOsc.stop(startTime + decayTime);
};

export default function GuitaleleViewer({ scoreData }) {
    const [hoveredNoteIndex, setHoveredNoteIndex] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackIndex, setPlaybackIndex] = useState(null);
    const [bpm, setBpm] = useState(100);

    const audioCtxRef = useRef(null);
    const playbackTimeoutsRef = useRef([]);

    const scoreLayout = useMemo(() => {
        if (!scoreData || !scoreData.notes) return null;

        const paddingX = 140;
        const noteSpacing = 115; // EXPANDED layout lane spacing to give dense 16th notes beautiful horizontal clearance
        const lineSpacing = 14;
        const trebleTopY = 70;
        const bassTopY = 150;
        const tabTopY = 250;
        const rhythmTopY = 350;
        const svgHeight = 390;

        const timeSigTop = scoreData.timeSignature?.split('/')[0] || '4';
        const timeSigBottom = scoreData.timeSignature?.split('/')[1] || '4';
        const beatsPerMeasure = parseInt(timeSigTop, 10);

        let processedEvents = scoreData.notes.map((event, index) => {
            let detectedRhythm = event.rhythm;
            let pitches = event.pitches || [];
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
                pitches,
                globalIndex: index,
                rhythm: detectedRhythm || (isRestEvent ? 'x' : ':'),
                beatValue,
                isRest: isRestEvent || (detectedRhythm && detectedRhythm.startsWith('x'))
            };
        });

        const events = processedEvents.map((ev, idx) => ({
            ...ev,
            isTiedToNext: !!ev.tie,
            isTiedFromPrev: idx > 0 ? !!processedEvents[idx - 1].tie : false
        }));

        let rows = [];
        let currentRowEvents = [];
        let accumulatedBeats = 0;
        let measuresInRow = 0;
        const MAX_MEASURES_PER_ROW = 4;
        const MAX_NOTES_PER_ROW = 64;

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

        const computedRows = rows.map((rowEvents) => {
            const totalWidth = paddingX * 2 + (rowEvents.length * noteSpacing);
            const barlineXPositions = [];
            let rowBeatTracker = 0;

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

                const treblePitches = processedPitches.filter(p => p.clef === 'treble');
                const bassPitches = processedPitches.filter(p => p.clef === 'bass');

                const computeStaffStemData = (pitches, midLineMidi) => {
                    if (pitches.length === 0) return null;
                    const staffYs = pitches.map(p => p.staffY);
                    const lowestY = Math.max(...staffYs);
                    const highestY = Math.min(...staffYs);
                    const avgMidi = pitches.reduce((sum, p) => sum + p.midi, 0) / pitches.length;
                    const stemDown = avgMidi >= midLineMidi;

                    return { lowestY, highestY, stemDown };
                };

                return {
                    ...ev,
                    cx,
                    processedPitches,
                    trebleStem: computeStaffStemData(treblePitches, 71),
                    bassStem: computeStaffStemData(bassPitches, 50)
                };
            });

            return { rowEvents: renderedEvents, totalWidth, barlineXPositions };
        });

        return { computedRows, timeSigTop, timeSigBottom, paddingX, trebleTopY, bassTopY, tabTopY, rhythmTopY, svgHeight, lineSpacing, noteSpacing };
    }, [scoreData]);

    useEffect(() => {
        return () => stopPlayback();
    }, []);

    if (!scoreLayout) return null;

    const { computedRows, timeSigTop, timeSigBottom, paddingX, trebleTopY, bassTopY, tabTopY, rhythmTopY, svgHeight, lineSpacing, noteSpacing } = scoreLayout;

    const startPlayback = () => {
        if (isPlaying) return;

        // Ensure we create a fresh audio context if it was previously closed
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
            audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume();

        setIsPlaying(true);

        const allEvents = scoreLayout.computedRows.flatMap(r => r.rowEvents);
        const beatDurationSeconds = 60 / bpm;
        let currentScheduleTime = ctx.currentTime + 0.1;
        let currentElapsedTimeMs = 100;

        allEvents.forEach((ev) => {
            const noteDurationSec = ev.beatValue * beatDurationSeconds;
            const targetIndex = ev.globalIndex;

            if (!ev.isRest) {
                const sortedPitches = [...ev.processedPitches].sort((a, b) => b.string - a.string);

                sortedPitches.forEach((pitch, pitchIdx) => {
                    const strumDelay = sortedPitches.length > 1 ? pitchIdx * 0.022 : 0.0;
                    const humanJitter = (Math.random() - 0.5) * 0.006;
                    const humanVelocity = 0.86 + Math.random() * 0.24;

                    const finalPluckTime = currentScheduleTime + strumDelay + humanJitter;

                    playHumanizedGuitaleleNote(ctx, pitch.midi, finalPluckTime, noteDurationSec, humanVelocity);
                });
            }

            const visualTimeout = setTimeout(() => {
                setPlaybackIndex(targetIndex);
            }, currentElapsedTimeMs);

            playbackTimeoutsRef.current.push(visualTimeout);
            currentScheduleTime += noteDurationSec;
            currentElapsedTimeMs += noteDurationSec * 1000;
        });

        const endTimeout = setTimeout(() => {
            setIsPlaying(false);
            setPlaybackIndex(null);
        }, currentElapsedTimeMs);
        playbackTimeoutsRef.current.push(endTimeout);
    };

    const stopPlayback = () => {
        // 1. Clear the visual progression state
        playbackTimeoutsRef.current.forEach(t => clearTimeout(t));
        playbackTimeoutsRef.current = [];
        setIsPlaying(false);
        setPlaybackIndex(null);

        // 2. Immediately terminate all scheduled hardware audio
        if (audioCtxRef.current) {
            audioCtxRef.current.close();
            audioCtxRef.current = null;
        }
    };

    return (
        <div className={`w-full h-screen overflow-y-auto ${DARK_THEME.bgPage} p-6 flex flex-col gap-6 rounded-xl`}>

            {/* Control Strip */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg w-full max-w-xl mx-auto">
                <button
                    onClick={isPlaying ? stopPlayback : startPlayback}
                    className={`whitespace-nowrap px-6 py-2 rounded-lg text-sm font-bold tracking-wide transition-all ${isPlaying
                            ? 'bg-rose-600 text-white hover:bg-rose-500'
                            : 'bg-emerald-600 text-white hover:bg-emerald-500'
                        }`}
                >
                    {isPlaying ? '⏹ STOP SCORE' : '▶ PLAY GUITALELE'}
                </button>

                {/* BPM Wrapper with left border padding for spacing */}
                <div className="flex items-center gap-6 flex-1 w-full pl-2 md:pl-6 md:border-l border-slate-700">
                    <span className="text-xs font-mono text-slate-400 whitespace-nowrap">
                        TEMPO: {bpm} BPM
                    </span>
                    <input
                        type="range" min="60" max="180" value={bpm}
                        disabled={isPlaying}
                        onChange={(e) => setBpm(parseInt(e.target.value))}
                        className="w-full accent-cyan-400 bg-slate-950 rounded-lg cursor-pointer disabled:opacity-30"
                    />
                </div>
            </div>

            {/* Score Grid Viewport */}
            <div className="flex flex-col gap-8">
                {computedRows.map(({ rowEvents, totalWidth, barlineXPositions }, rowIdx) => {
                    return (
                        <div key={`row-${rowIdx}`} className={`${DARK_THEME.bgScore} ${DARK_THEME.borderScore} border rounded-lg shadow-xl p-4 w-full overflow-x-auto`}>
                            <svg width={totalWidth} height={svgHeight} className="select-none mx-auto block">

                                {/* Clef System Brace */}
                                <path d={`M ${paddingX - 115} ${trebleTopY} L ${paddingX - 122} ${trebleTopY} L ${paddingX - 122} ${bassTopY + 4 * lineSpacing} L ${paddingX - 115} ${bassTopY + 4 * lineSpacing}`} fill="none" stroke={DARK_THEME.lineStaff} strokeWidth="2.5" />

                                {/* Treble Staff */}
                                {[0, 1, 2, 3, 4].map((i) => (<line key={`treble-${i}`} x1={paddingX} y1={trebleTopY + i * lineSpacing} x2={totalWidth - paddingX} y2={trebleTopY + i * lineSpacing} stroke={DARK_THEME.lineStaff} strokeWidth="1" />))}
                                <text x={paddingX - 105} y={trebleTopY + (3.5 * lineSpacing)} className="text-4xl font-serif" fill={DARK_THEME.textClef}>𝄞</text>

                                {/* Bass Staff */}
                                {[0, 1, 2, 3, 4].map((i) => (<line key={`bass-${i}`} x1={paddingX} y1={bassTopY + i * lineSpacing} x2={totalWidth - paddingX} y2={bassTopY + i * lineSpacing} stroke={DARK_THEME.lineStaff} strokeWidth="1" />))}
                                <text x={paddingX - 105} y={bassTopY + (3.2 * lineSpacing)} className="text-4xl font-serif" fill={DARK_THEME.textClef}>𝄢</text>

                                {/* Time Signatures */}
                                <g className="font-serif font-black text-2xl text-center" fill={DARK_THEME.textTimeSig} transform={`translate(${paddingX - 55}, 0)`}>
                                    <text x="0" y={trebleTopY + 16} textAnchor="middle">{timeSigTop}</text><text x="0" y={trebleTopY + 42} textAnchor="middle">{timeSigBottom}</text>
                                    <text x="0" y={bassTopY + 16} textAnchor="middle">{timeSigTop}</text><text x="0" y={bassTopY + 42} textAnchor="middle">{timeSigBottom}</text>
                                    <text x="0" y={tabTopY + 24} textAnchor="middle" className="text-xl font-sans font-bold" fill={DARK_THEME.textTabLabel}>{timeSigTop}</text><text x="0" y={tabTopY + 54} textAnchor="middle" className="text-xl font-sans font-bold" fill={DARK_THEME.textTabLabel}>{timeSigBottom}</text>
                                </g>

                                {/* Guitar Tablature Lines */}
                                {[0, 1, 2, 3, 4, 5].map((i) => (<line key={`t-l-${i}`} x1={paddingX} y1={tabTopY + i * lineSpacing} x2={totalWidth - paddingX} y2={tabTopY + i * lineSpacing} stroke={DARK_THEME.lineTab} strokeWidth="1.2" />))}
                                <g transform={`translate(${paddingX - 105}, ${tabTopY + 12})`} fill={DARK_THEME.textTabLabel} className="font-black tracking-tighter text-xs">
                                    <text x="0" y="0">T</text><text x="0" y="14">A</text><text x="0" y="28">B</text>
                                </g>
                                {[0, 1, 2, 3, 4, 5].map((i) => (<text key={`string-${i}`} x={paddingX - 15} y={tabTopY + (i * lineSpacing) + 4} textAnchor="end" className="text-[9px] font-bold" fill={DARK_THEME.textTabString}>{i + 1}</text>))}

                                {/* Boundary Frames & Barlines */}
                                <line x1={paddingX} y1={trebleTopY} x2={paddingX} y2={bassTopY + 4 * lineSpacing} stroke={DARK_THEME.lineBar} strokeWidth="2" />
                                <line x1={paddingX} y1={tabTopY} x2={paddingX} y2={tabTopY + 5 * lineSpacing} stroke={DARK_THEME.lineTab} strokeWidth="2" />
                                {barlineXPositions.map((barX, i) => (
                                    <g key={`barline-${i}`}>
                                        <line x1={barX} y1={trebleTopY} x2={barX} y2={bassTopY + 4 * lineSpacing} stroke={DARK_THEME.lineBar} strokeWidth="1.6" />
                                        <line x1={barX} y1={tabTopY} x2={barX} y2={tabTopY + 5 * lineSpacing} stroke={DARK_THEME.lineTab} strokeWidth="1.6" />
                                    </g>
                                ))}
                                <line x1={totalWidth - paddingX} y1={trebleTopY} x2={totalWidth - paddingX} y2={bassTopY + 4 * lineSpacing} stroke={DARK_THEME.lineBar} strokeWidth="2" />
                                <line x1={totalWidth - paddingX} y1={tabTopY} x2={totalWidth - paddingX} y2={tabTopY + 5 * lineSpacing} stroke={DARK_THEME.lineTab} strokeWidth="2" />

                                {/* Event Mapping Node Sequence */}
                                {rowEvents.map((ev, idx) => {
                                    const isHovered = hoveredNoteIndex === ev.globalIndex;
                                    const isCurrentlyPlaying = playbackIndex === ev.globalIndex;

                                    const isActive = isHovered || isCurrentlyPlaying;
                                    const currentNoteFill = isActive ? DARK_THEME.fillNoteHover : DARK_THEME.fillNote;
                                    const currentNoteStroke = isActive ? DARK_THEME.strokeNoteHover : DARK_THEME.fillNote;
                                    const currentStemStroke = isActive ? DARK_THEME.strokeNoteHover : DARK_THEME.lineStem;
                                    const currentTabFill = isActive ? DARK_THEME.textTabNumberHover : DARK_THEME.textTabNumber;
                                    const currentRhythmFill = isActive ? DARK_THEME.textRhythmHover : DARK_THEME.textRhythm;

                                    return (
                                        <g key={`node-${idx}`}>

                                            {/* Lane Active Track Bounds */}
                                            {isActive && (
                                                <rect
                                                    x={ev.cx - (noteSpacing / 2) + 5}
                                                    y={trebleTopY - 50}
                                                    width={noteSpacing - 10}
                                                    height={rhythmTopY - trebleTopY + 60}
                                                    fill={DARK_THEME.fillHoverHighlight}
                                                    rx={4}
                                                />
                                            )}

                                            {/* Mask Trigger Area */}
                                            <rect
                                                x={ev.cx - (noteSpacing / 2)} y={trebleTopY - 15}
                                                width={noteSpacing} height={rhythmTopY - trebleTopY + 35}
                                                fill="transparent" pointerEvents="all" className="cursor-pointer"
                                                onMouseEnter={() => setHoveredNoteIndex(ev.globalIndex)}
                                                onMouseLeave={() => setHoveredNoteIndex(null)}
                                            />

                                            {ev.isRest ? (
                                                <g>
                                                    {ev.rhythm === 'x' && <path d={`M ${ev.cx - 4} ${trebleTopY + 28} L ${ev.cx + 4} ${trebleTopY + 34} L ${ev.cx - 4} ${trebleTopY + 40} Q ${ev.cx + 6} ${trebleTopY + 44} ${ev.cx} ${trebleTopY + 50}`} fill="none" stroke={DARK_THEME.fillRest} strokeWidth="2" strokeLinecap="round" />}
                                                    {ev.rhythm === 'x+' && <path d={`M ${ev.cx - 3} ${trebleTopY + 32} A 3.5 3.5 0 1 1 ${ev.cx + 2} ${trebleTopY + 34} Q ${ev.cx - 2} ${trebleTopY + 38} ${ev.cx + 4} ${trebleTopY + 30} L ${ev.cx - 3} ${trebleTopY + 50}`} fill="none" stroke={DARK_THEME.fillRest} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}
                                                    {ev.rhythm === 'x=' && (
                                                        <g>
                                                            <path d={`M ${ev.cx - 2} ${trebleTopY + 27} A 3 3 0 1 1 ${ev.cx + 3} ${trebleTopY + 29} Q ${ev.cx - 1} ${trebleTopY + 33} ${ev.cx + 5} ${trebleTopY + 25}`} fill="none" stroke={DARK_THEME.fillRest} strokeWidth="2" />
                                                            <path d={`M ${ev.cx - 4} ${trebleTopY + 36} A 3 3 0 1 1 ${ev.cx + 1} ${trebleTopY + 38} Q ${ev.cx - 3} ${trebleTopY + 42} ${ev.cx + 3} ${trebleTopY + 34} L ${ev.cx - 4} ${trebleTopY + 52}`} fill="none" stroke={DARK_THEME.fillRest} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        </g>
                                                    )}
                                                    <rect x={ev.cx - 6} y={tabTopY + (2 * lineSpacing) - 4} width={12} height={16} fill={DARK_THEME.bgTabRect} />
                                                    <text x={ev.cx} y={tabTopY + (3 * lineSpacing) - 2} textAnchor="middle" className="text-[10px] font-mono font-bold" fill={DARK_THEME.fillRest}>𝄾</text>
                                                </g>
                                            ) : (
                                                <g>
                                                    {ev.processedPitches.map((pitch, pIdx) => {
                                                        const clefTopY = pitch.clef === 'treble' ? trebleTopY : bassTopY;
                                                        const bottomStaffEdge = clefTopY + (4 * lineSpacing);
                                                        const lowerLedgers = pitch.staffY > bottomStaffEdge ? Math.floor((pitch.staffY - bottomStaffEdge) / lineSpacing) : 0;
                                                        const upperLedgers = pitch.staffY < clefTopY ? Math.floor((clefTopY - pitch.staffY) / lineSpacing) : 0;

                                                        return (
                                                            <g key={`p-${pIdx}`}>
                                                                {pitch.isSharp && <text x={ev.cx - 15} y={pitch.staffY + 5} className="text-base font-normal font-serif" fill={currentNoteFill}>♯</text>}

                                                                {Array.from({ length: Math.max(0, upperLedgers) }).map((_, lIdx) => (<line key={`up-ledg-${lIdx}`} x1={ev.cx - 10} y1={clefTopY - ((lIdx + 1) * lineSpacing)} x2={ev.cx + 10} y2={clefTopY - ((lIdx + 1) * lineSpacing)} stroke={DARK_THEME.lineStaff} strokeWidth="1.2" />))}
                                                                {Array.from({ length: Math.max(0, lowerLedgers) }).map((_, lIdx) => (<line key={`low-ledg-${lIdx}`} x1={ev.cx - 10} y1={bottomStaffEdge + ((lIdx + 1) * lineSpacing)} x2={ev.cx + 10} y2={bottomStaffEdge + ((lIdx + 1) * lineSpacing)} stroke={DARK_THEME.lineStaff} strokeWidth="1.2" />))}

                                                                {ev.beatValue >= 2.0 ? (
                                                                    <ellipse cx={ev.cx} cy={pitch.staffY} rx={5.5} ry={4} transform={`rotate(-22 ${ev.cx} ${pitch.staffY})`} fill="none" stroke={currentNoteStroke} strokeWidth="1.8" />
                                                                ) : (
                                                                    <ellipse cx={ev.cx} cy={pitch.staffY} rx={5.5} ry={4} transform={`rotate(-22 ${ev.cx} ${pitch.staffY})`} fill={currentNoteFill} />
                                                                )}

                                                                {ev.isTiedToNext && rowEvents[idx + 1] && !rowEvents[idx + 1].isRest && (
                                                                    (() => {
                                                                        const targetPitch = rowEvents[idx + 1].processedPitches.find(np => np.string === pitch.string);
                                                                        if (targetPitch) {
                                                                            return (<path d={`M ${ev.cx + 4} ${pitch.staffY + 5} Q ${(ev.cx + rowEvents[idx + 1].cx) / 2} ${Math.max(pitch.staffY, targetPitch.staffY) + 16} ${rowEvents[idx + 1].cx - 4} ${targetPitch.staffY + 5}`} fill="none" stroke={DARK_THEME.lineTie} strokeWidth="1.8" strokeLinecap="round" />);
                                                                        }
                                                                    })()
                                                                )}

                                                                <rect x={ev.cx - 7} y={pitch.tabY - 7} width={14} height={14} fill={DARK_THEME.bgTabRect} />
                                                                <text x={ev.cx} y={pitch.tabY + 4} textAnchor="middle" className="text-[11px] font-sans font-bold" fill={currentTabFill}>{pitch.fret}</text>
                                                            </g>
                                                        );
                                                    })}

                                                    {/* Treble Voice Stems */}
                                                    {ev.trebleStem && ev.beatValue < 4.0 && (() => {
                                                        const { lowestY, highestY, stemDown } = ev.trebleStem;
                                                        const xPos = stemDown ? ev.cx - 5.5 : ev.cx + 5.5;
                                                        const extY = stemDown ? lowestY + 28 : highestY - 28;
                                                        return (
                                                            <g>
                                                                <line x1={xPos} y1={highestY} x2={xPos} y2={extY} stroke={currentStemStroke} strokeWidth="1.6" />
                                                                {ev.beatValue === 0.5 && <path d={getFlagPath(xPos, extY, stemDown, false)} fill={currentNoteFill} />}
                                                                {ev.beatValue <= 0.25 && <path d={getFlagPath(xPos, extY, stemDown, true)} fill={currentNoteFill} />}
                                                            </g>
                                                        );
                                                    })()}

                                                    {/* Bass Voice Stems */}
                                                    {ev.bassStem && ev.beatValue < 4.0 && (() => {
                                                        const { lowestY, highestY, stemDown } = ev.bassStem;
                                                        const xPos = stemDown ? ev.cx - 5.5 : ev.cx + 5.5;
                                                        const extY = stemDown ? lowestY + 28 : highestY - 28;
                                                        return (
                                                            <g>
                                                                <line x1={xPos} y1={highestY} x2={xPos} y2={extY} stroke={currentStemStroke} strokeWidth="1.6" />
                                                                {ev.beatValue === 0.5 && <path d={getFlagPath(xPos, extY, stemDown, false)} fill={currentNoteFill} />}
                                                                {ev.beatValue <= 0.25 && <path d={getFlagPath(xPos, extY, stemDown, true)} fill={currentNoteFill} />}
                                                            </g>
                                                        );
                                                    })()}

                                                    {/* Rhythm Extension Dot Flags */}
                                                    {[6.0, 3.0, 1.5, 0.75].includes(ev.beatValue) && (
                                                        <circle cx={ev.cx + 12} cy={(ev.trebleStem?.highestY || ev.bassStem?.highestY || trebleTopY) - 3} r={2} fill={currentNoteFill} />
                                                    )}
                                                </g>
                                            )}

                                            {/* Rhythm Structural Track Base */}
                                            <g>
                                                {ev.isTiedToNext && rowEvents[idx + 1] && (<line x1={ev.cx + 12} y1={rhythmTopY - 4} x2={rowEvents[idx + 1].cx - 12} y2={rhythmTopY - 4} stroke={DARK_THEME.lineStaff} strokeWidth="2" strokeLinecap="round" />)}
                                                <text x={ev.cx} y={rhythmTopY} textAnchor="middle" className="font-mono font-black text-sm" fill={ev.isRest ? DARK_THEME.fillRest : currentRhythmFill}>
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
        </div>
    );
}