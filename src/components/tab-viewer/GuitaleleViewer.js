import React, { useState, useMemo, useRef, useEffect } from "react";
import {
    DARK_THEME,
    calculateSchedulerBoundaries,
    getDurationLabel,
} from "./guitaleleViewerUtils";

import {
    stopPlaying,
    pausePlaying,
    resumePlaying,
    startPlaying,
    runScheduler
} from "./audio";
import { Table, Row, Col, Button, Form } from "react-bootstrap";

import { buildSvg } from "./svgUtils";
import { useBuildScoreLayout } from "./scoreBuilder";

export default function GuitaleleViewer({ scoreData }) {
    const [hoveredNoteIndex, setHoveredNoteIndex] = useState(null);
    const [clickedNoteIndex, setClickedNoteIndex] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [playbackIndex, setPlaybackIndex] = useState(null);
    const [bpm, setBpm] = useState(100);
    const [slotWidth, setSlotWidth] = useState(6);
    const containerRef = useRef(null);
    const [isAudioCompiled, setIsAudioCompiled] = useState(false);

    const [voice1Enabled, setVoice1Enabled] = useState(true);
    const [voice2Enabled, setVoice2Enabled] = useState(true);
    const [metronomeEnabled, setMetronomeEnabled] = useState(false);

    const lookaheadTimerRef = useRef(null);

    const { lookaheadInterval, scheduleAheadTime } = useMemo(() => {
        return calculateSchedulerBoundaries(bpm);
    }, [bpm]);

    const currentTimelineBeatsRef = useRef([]); // Holds unique sorted beat time slices
    const nextBeatIndexRef = useRef(0);

    // --- Responsive Layout State ---
    const [measuresPerRow, setMeasuresPerRow] = useState(4);

    const audioCtxRef = useRef(null);
    const playbackTimeoutsRef = useRef([]);

    // Track playback state mapping
    const currentPlaybackEventsRef = useRef([]);
    const playbackStartBeatRef = useRef(0);
    const pausedTimeRef = useRef(0);
    const playbackStartTimeRef = useRef(0);

    // Responsive window observer
    useEffect(() => {
        const updateLayoutBoundaries = () => {
            if (window.innerWidth < 480) {
                setMeasuresPerRow(1); // Extra small mobile layout profile
                setSlotWidth(40);
            } else if (window.innerWidth < 768) {
                setMeasuresPerRow(2); // Mobile layout profile
                setSlotWidth(50);
            } else {
                setMeasuresPerRow(4); // Tablet & Desktop profile
                setSlotWidth(50);
            }
        };

        updateLayoutBoundaries();
        window.addEventListener("resize", updateLayoutBoundaries);
        return () =>
            window.removeEventListener("resize", updateLayoutBoundaries);
    }, []);

    useEffect(() => {
        if (!isPlaying) {
            setClickedNoteIndex(null);
        }
    }, [isPlaying]);

    const scoreLayout = useBuildScoreLayout(scoreData, slotWidth, measuresPerRow);

    const preCompiledTimelineRef = useRef([]);

    useEffect(() => {
        if (!scoreLayout) return;

        setIsAudioCompiled(false);

        const timer = setTimeout(() => {
            const allEvents = scoreLayout.computedRows.flatMap(
                r => r.rowEvents
            );
            const compiledAudioTimeline = [];
            const consumedPitches = new Set();



            allEvents.forEach((ev, evIdx) => {
                if (ev.isMetronomeTick) {
                    compiledAudioTimeline.push({
                        ...ev,
                        type: "metronome",
                        isMetronomeTick: true,
                        voice: 0,
                        startBeat: ev.startBeat,
                        globalIndex: ev.globalIndex,
                        preCalculatedJitter: 0,
                        preCalculatedVelocity: 0,
                        segments: [{ type: "rest", duration: ev.beatValue }]
                    });
                    return;
                }

                if (ev.isRest) {
                    // Include rest events in the precompiled timeline so they can be visually highlighted
                    compiledAudioTimeline.push({
                        type: "rest",
                        voice: ev.voice,
                        startBeat: ev.startBeat,
                        globalIndex: ev.globalIndex,
                        preCalculatedJitter: 0,
                        preCalculatedVelocity: 0,
                        segments: [{ type: "rest", duration: ev.beatValue }]
                    });
                    return;
                }

                ev.processedPitches.forEach(pitch => {
                    const pitchKey = `${ev.globalIndex}_${pitch.string}`;
                    if (consumedPitches.has(pitchKey)) return;

                    if (pitch.fret === null) {
                        compiledAudioTimeline.push({
                            type: "mute",
                            voice: ev.voice,
                            startBeat: ev.startBeat,
                            globalIndex: ev.globalIndex,
                            preCalculatedJitter: (Math.random() - 0.5) * 0.003, // Pre-calculate here!
                            preCalculatedVelocity: 0.88 + Math.random() * 0.22,
                            segments: [{ type: "mute", duration: ev.beatValue }]
                        });
                        return;
                    }

                    const segments = [
                        {
                            type: "pluck",
                            midi: pitch.midi,
                            duration: ev.beatValue
                        }
                    ];

                    let currentEvent = ev;
                    let currentEventIdx = evIdx;
                    let currentPitch = pitch;

                    while (currentEvent.isTiedToNext) {
                        const nextEvent = allEvents
                            .slice(currentEventIdx + 1)
                            .find(
                                e => e.voice === currentEvent.voice && !e.isRest
                            );
                        if (!nextEvent) break;

                        const nextPitch = nextEvent.processedPitches.find(
                            np => np.string === currentPitch.string
                        );
                        if (!nextPitch) break;

                        const nextDuration = nextEvent.beatValue;

                        if (!segments[segments.length - 1].tiedEventIndices) {
                            segments[segments.length - 1].tiedEventIndices = [];
                        }
                        segments[segments.length - 1].tiedEventIndices.push({
                            globalIndex: nextEvent.globalIndex,
                            beatOffset: nextEvent.startBeat - ev.startBeat
                        });

                        if (nextPitch.midi === currentPitch.midi) {
                            segments.push({
                                type: "tie",
                                midi: nextPitch.midi,
                                duration: nextDuration
                            });
                        } else {
                            const currentSeg = segments[segments.length - 1];
                            const halfDuration = currentSeg.duration / 2;
                            currentSeg.duration = halfDuration;

                            segments.push({
                                type: "slide",
                                midi: nextPitch.midi,
                                duration: halfDuration
                            });
                            segments.push({
                                type: "tie",
                                midi: nextPitch.midi,
                                duration: nextDuration
                            });
                        }

                        const nextKey = `${nextEvent.globalIndex}_${nextPitch.string}`;
                        consumedPitches.add(nextKey);

                        currentEventIdx = allEvents.indexOf(nextEvent);
                        currentEvent = nextEvent;
                        currentPitch = nextPitch;
                    }

                    compiledAudioTimeline.push({
                        type: "pluck",
                        voice: ev.voice,
                        startBeat: ev.startBeat,
                        globalIndex: ev.globalIndex,
                        midi: pitch.midi,
                        preCalculatedJitter: (Math.random() - 0.5) * 0.003, // Pre-calculate here!
                        preCalculatedVelocity: 0.88 + Math.random() * 0.22, // Pre-calculate here!
                        segments: segments
                    });
                });
            });

            preCompiledTimelineRef.current = compiledAudioTimeline;
            setIsAudioCompiled(true);
        }, 100);

        return () => clearTimeout(timer);
    }, [scoreLayout]);

    // Extract an array of all unique voice IDs present in the score
    const availableVoices = useMemo(() => {
        if (!scoreLayout || !scoreLayout.computedRows) return [];

        const allEvents = scoreLayout.computedRows.flatMap(r => r.rowEvents);
        const voiceIds = allEvents.map(ev => ev.voice);

        // Using a Set eliminates duplicates, then Array.from turns it back into a sorted array
        return Array.from(new Set(voiceIds)).sort((a, b) => a - b);
    }, [scoreLayout]);

    const stopPlayback = stopPlaying(lookaheadTimerRef, playbackTimeoutsRef, setIsPlaying, setIsPaused, setPlaybackIndex, pausedTimeRef, audioCtxRef);

    const pausePlayback = pausePlaying(isPlaying, isPaused, lookaheadTimerRef, playbackTimeoutsRef, audioCtxRef, playbackStartTimeRef, pausedTimeRef, setIsPaused);

    const runSchedulerLoop = runScheduler(playbackStartBeatRef, audioCtxRef, bpm, playbackStartTimeRef, pausedTimeRef, nextBeatIndexRef, currentTimelineBeatsRef, scheduleAheadTime, setPlaybackIndex, playbackTimeoutsRef, stopPlayback, lookaheadTimerRef, lookaheadInterval, metronomeEnabled);

    const resumePlayback = resumePlaying(isPlaying, isPaused, audioCtxRef, playbackStartTimeRef, setIsPaused, runSchedulerLoop);

    const startPlayback = startPlaying(isPlaying, scoreLayout, isAudioCompiled, audioCtxRef, setIsPlaying, setIsPaused, pausedTimeRef, playbackStartTimeRef, currentPlaybackEventsRef, playbackStartBeatRef, preCompiledTimelineRef, currentTimelineBeatsRef, nextBeatIndexRef, runSchedulerLoop, voice1Enabled, voice2Enabled, metronomeEnabled);


    useEffect(() => {
        return () => stopPlayback();
    }, []);

    const activeTargetIndex = (isPlaying && !isPaused) ? playbackIndex : (hoveredNoteIndex !== null ? hoveredNoteIndex : clickedNoteIndex);

    const handleNoteClick = (globalIndex) => {
        if (isPlaying) return; // Do nothing if the score is playing

        setClickedNoteIndex(prevIndex => {
            // If they click the already selected note, toggle it off
            return prevIndex === globalIndex ? null : globalIndex;
        });
    };

    // Replace `activeEvent` with `activeEvents` and `activeIndices`
    const activeEvents = useMemo(() => {
        if (activeTargetIndex === null || !scoreLayout) return [];

        const allEvents = scoreLayout.computedRows.flatMap(r => r.rowEvents);
        const targetEvent = allEvents.find(
            ev => ev.globalIndex === activeTargetIndex
        );

        if (!targetEvent) return [];

        // Fetch all playable events at this beat. Metronome-only beats should not drive note highlighting.
        return allEvents.filter(
            ev =>
                ev.measureNumber === targetEvent.measureNumber &&
                ev.startBeat === targetEvent.startBeat &&
                !ev.isMetronomeTick
        );
    }, [activeTargetIndex, scoreLayout]);

    const activeIndices = useMemo(
        () => activeEvents.map(e => e.globalIndex),
        [activeEvents]
    );

    const activeDescription = useMemo(() => {
        if (!activeEvents || activeEvents.length === 0) return null;

        const voiceColors = ['#21cea3', '#fb923c', '#6c5ce7', '#e17055']; // Match theme colors

        return (
            <div className="d-flex flex-column" style={{ gap: '6px' }}>
                <div style={{ color: '#8892b0', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Measure {activeEvents[0].measureNumber}
                </div>

                <div className="d-flex flex-column" style={{ gap: '8px' }}>
                    {activeEvents.map((ev, idx) => {
                        const color = voiceColors[(ev.voice - 1) % voiceColors.length] || voiceColors[0];

                        return (
                            <div key={idx} className="d-flex align-items-start" style={{
                                borderLeft: `3px solid ${color}`,
                                paddingLeft: '12px'
                            }}>
                                <div className="d-flex flex-column flex-grow-1">
                                    {ev.isRest ? (
                                        <span style={{ color: '#636e72', fontSize: '11px', fontStyle: 'italic' }}>
                                            <span style={{ color }}>V{ev.voice}</span> • Rest • {getDurationLabel(ev.beatValue)}
                                        </span>
                                    ) : (
                                        <>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <span style={{ color: '#fdcb6e', fontSize: '10px', fontWeight: 'bold', minWidth: '40px' }}>
                                                    {getDurationLabel(ev.beatValue).toUpperCase()}
                                                </span>
                                                <span style={{ color, fontSize: '10px', fontWeight: 'bold' }}>VOICE {ev.voice}</span>
                                            </div>

                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '2px', paddingLeft: '8px' }}>
                                                {ev.processedPitches.map((p, pIdx) => (
                                                    <div key={pIdx} style={{ fontSize: '11px', color: '#dfe6e9' }}>
                                                        • {p.noteName}
                                                        <span style={{ color: '#658591', marginLeft: '4px' }}>String {p.string} Fret{p.fret}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}

                                    {/* --- FIXED: DISPLAY BEAT DESCRIPTIONS --- */}
                                    {ev.description && (
                                        <div style={{
                                            fontSize: '11px',
                                            color: '#aaccff',
                                            fontStyle: 'italic',
                                            marginTop: '4px',
                                            background: 'rgba(255,255,255,0.03)',
                                            padding: '4px 6px',
                                            borderRadius: '3px'
                                        }}>
                                            {ev.description}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }, [activeEvents]);

    // 1. Find which row index contains the currently playing note index
    const activeRowIndex = useMemo(() => {
        if (playbackIndex === null || !scoreLayout) return -1;
        return scoreLayout.computedRows.findIndex(row =>
            row.rowEvents.some(ev => ev.globalIndex === playbackIndex)
        );
    }, [playbackIndex, scoreLayout]);

    // 2. Efficiently snap to the top of the row ONLY when changing lines
    const prevRowIndexRef = useRef(-1);
    useEffect(() => {
        const scrollContainer = containerRef.current;
        if (!scrollContainer) return;

        if (!isPlaying) {
            scrollContainer.scrollTo({
                top: 0,
                behavior: "smooth"
            });
            prevRowIndexRef.current = -1;
            return;
        }

        if (activeRowIndex !== -1 && activeRowIndex !== prevRowIndexRef.current) {
            prevRowIndexRef.current = activeRowIndex;

            const rowElements = scrollContainer.querySelectorAll("tbody tr");
            const targetRow = rowElements[activeRowIndex];

            if (targetRow) {
                const containerRect = scrollContainer.getBoundingClientRect();
                const rowRect = targetRow.getBoundingClientRect();

                // Calculate the position to line up the row's top edge perfectly with the container's top
                const targetScrollTop = rowRect.top - containerRect.top + scrollContainer.scrollTop;

                scrollContainer.scrollTo({
                    top: Math.max(0, targetScrollTop - 20), // 4px padding for a clean aesthetic look
                    behavior: "auto"
                });
            }
        }
    }, [activeRowIndex, isPlaying]);


    if (!scoreLayout) {
        return (
            <div className="text-slate-500 font-mono text-xs p-4">
                No notation data package available.
            </div>
        );
    }

    const {
        computedRows,
        timeSigTop,
        timeSigBottom,
        paddingX,
        trebleTopY,
        bassTopY,
        tabTopY,
        rhythmTopY,
        lineSpacing,
        SLOT_WIDTH,
        measureValidityMap,
        beatsPerMeasure
    } = scoreLayout;

    const rhythm1TopY = rhythmTopY;
    const rhythm2TopY = rhythmTopY + 28;

    return (
        <div
            className="d-flex flex-column bg-dark"
            style={{
                height: 'calc(100vh - 20px)', // Takes up full screen height minus a small margin
                overflow: 'hidden'             // Prevents the window scrollbar from appearing
            }}
        >
            <div className="bg-dark border-bottom border-secondary text-light p-2 sticky-top shrink-0 d-flex gap-2" style={{ height: 'auto' }}>

                <div className="d-flex flex-column gap-1" style={{ width: '140px', flexShrink: 0 }}>

                    {/* Row 1: Playback Controls */}
                    <div className="btn-group bg-black p-1 rounded border border-secondary" style={{ height: '32px', alignItems: 'center' }}>
                        {!isPlaying ? (
                            <Button variant="link" onClick={startPlayback} className="text-success p-1" title="Start"
                                disabled={!((voice1Enabled && availableVoices.includes(1)) || (voice2Enabled && availableVoices.includes(2)) || metronomeEnabled)}>
                                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                            </Button>
                        ) : isPaused ? (
                            <Button variant="link" onClick={resumePlayback} className="text-warning p-1" title="Resume">
                                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                            </Button>
                        ) : (
                            <Button variant="link" onClick={pausePlayback} className="text-warning p-1" title="Pause">
                                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                            </Button>
                        )}
                        <Button variant="link" onClick={stopPlayback} disabled={!isPlaying} className={`p-1 ${isPlaying ? 'text-danger' : 'text-muted'}`} title="Stop">
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h12v12H6z" /></svg>
                        </Button>
                    </div>

                    <div className="bg-black px-2 py-1 rounded border border-secondary d-flex align-items-center gap-2" style={{ height: '32px' }}>
                        <Form.Range
                            min="40"
                            max="240"
                            value={bpm}
                            onChange={(e) => setBpm(parseInt(e.target.value, 10))}
                            disabled={isPlaying}
                            className="flex-grow-1"
                        />
                        <span className="text-warning fw-bold font-monospace" style={{ fontSize: '10px', minWidth: '24px' }}>{bpm}</span>
                    </div>

                    <div className="bg-black px-2 py-1 rounded border border-secondary d-flex flex-column gap-1">

                        {/* Line 1: V1 and V2 side-by-side */}
                        <div className="d-flex align-items-center gap-2">
                            {/* V1 - Takes up 50% width */}
                            <div className="d-flex align-items-center justify-content-between flex-grow-1" style={{ height: '18px' }}>
                                <span style={{
                                    fontSize: '10px',
                                    color: voice1Enabled ? DARK_THEME.voice1Color : '#8892b0',
                                    fontWeight: 'bold'
                                }}>V1</span>
                                <Form.Check
                                    type="switch"
                                    id="voice-toggle-0"
                                    label=""
                                    className="m-0 d-flex align-items-center"
                                    style={{ transform: 'scale(0.8)', transformOrigin: 'right center' }}
                                    checked={voice1Enabled && availableVoices.includes(1)}
                                    disabled={isPlaying || !availableVoices.includes(1)}
                                    onChange={(e) => setVoice1Enabled(e.target.checked)}
                                />
                            </div>

                            {/* Divider line between V1 and V2 */}
                            <div className="border-start border-secondary" style={{ height: '12px' }}></div>

                            {/* V2 - Takes up 50% width */}
                            <div className="d-flex align-items-center justify-content-between flex-grow-1" style={{ height: '18px' }}>
                                <span style={{
                                    fontSize: '10px',
                                    color: voice2Enabled ? DARK_THEME.voice2Color : '#8892b0',
                                    fontWeight: 'bold'
                                }}>V2</span>
                                <Form.Check
                                    type="switch"
                                    id="voice-toggle-1"
                                    label=""
                                    className="m-0 d-flex align-items-center"
                                    style={{ transform: 'scale(0.8)', transformOrigin: 'right center' }}
                                    checked={voice2Enabled && availableVoices.includes(2)}
                                    disabled={isPlaying || !availableVoices.includes(2)}
                                    onChange={(e) => setVoice2Enabled(e.target.checked)}
                                />
                            </div>
                        </div>

                        {/* Thin divider between the voice row and metronome row */}
                        <div className="border-top border-secondary-subtle opacity-25" style={{ margin: '2px 0' }}></div>

                        {/* Line 2: Full Metronome spanning across the bottom */}
                        <div className="d-flex align-items-center justify-content-between" style={{ height: '18px' }}>
                            <span style={{
                                fontSize: '10px',
                                color: metronomeEnabled ? DARK_THEME.metronomeControlMedium : '#8892b0',
                                fontWeight: 'bold'
                            }}>
                                Metronome
                            </span>
                            <Form.Check
                                type="switch"
                                id="metronome-toggle"
                                label=""
                                className="m-0 d-flex align-items-center"
                                style={{ transform: 'scale(0.8)', transformOrigin: 'right center' }}
                                checked={metronomeEnabled}
                                disabled={isPlaying}
                                onChange={(e) => setMetronomeEnabled(e.target.checked)}
                            />
                        </div>

                    </div>

                </div>

                <div
                    className="bg-black border border-secondary rounded p-2 text-info font-monospace flex-grow-1"
                    style={{
                        height: '135px',        // Fixed vertical length
                        overflowY: 'auto',       // Only the description scrolls
                        fontSize: '12px',
                        lineHeight: '1.2'
                    }}
                >
                    {activeDescription || <span className="text-muted fst-italic">Select a note to view properties.</span>}
                </div>
            </div>

            {/* 3. THE TRUE SCROLL VIEWPORT: Only things inside this box will move or scroll */}
            <div
                ref={containerRef}
                className="flex-grow-1"
                style={{
                    overflowY: 'auto',
                    paddingTop: '12px',
                    paddingBottom: '150px',
                }}
            >
                <Table responsive bordered={false} style={{ margin: 0, width: '100%' }}>
                    <tbody>
                        {computedRows.map((row, index) => {
                            // Dynamically adjust padding between layout lines based on screen real estate profile
                            const rowPaddingBottom = measuresPerRow === 1 ? '20px' : measuresPerRow === 2 ? '32px' : '48px';

                            return (
                                <tr key={index}>
                                    <td style={{ border: "0", padding: `0 12px ${rowPaddingBottom} 12px` }}>
                                        {buildSvg(
                                            paddingX,
                                            trebleTopY,
                                            bassTopY,
                                            lineSpacing,
                                            timeSigTop,
                                            timeSigBottom,
                                            tabTopY,
                                            measureValidityMap,
                                            rhythmTopY,
                                            beatsPerMeasure,
                                            activeIndices,
                                            rhythm2TopY,
                                            rhythm1TopY,
                                            SLOT_WIDTH,
                                            isPlaying,
                                            isPaused,
                                            playbackIndex,
                                            setHoveredNoteIndex,
                                            handleNoteClick,
                                            measuresPerRow,
                                            voice1Enabled && availableVoices.includes(1),
                                            voice2Enabled && availableVoices.includes(2),
                                            metronomeEnabled
                                        )(row, index)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            </div>
        </div>
    );
}

