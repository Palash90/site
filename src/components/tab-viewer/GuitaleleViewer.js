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
    const [viewMode, setViewMode] = useState('tab'); // 'tab', 'both', 'sheet'

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

    const countInBeat = isPlaying && playbackIndex !== null && playbackIndex < 0 ? -playbackIndex : 0;
    const activeTargetIndex = isPlaying
        ? (isPaused && clickedNoteIndex !== null ? clickedNoteIndex : playbackIndex)
        : clickedNoteIndex;

    const handleNoteClick = (globalIndex) => {
        if (isPlaying && !isPaused) return;

        setClickedNoteIndex(prevIndex => {
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
        ).sort((a, b) => (a.voice || 1) - (b.voice || 1));
    }, [activeTargetIndex, scoreLayout]);

    const activeIndices = useMemo(
        () => activeEvents.map(e => e.globalIndex),
        [activeEvents]
    );

    const activeDescription = useMemo(() => {
        if (!activeEvents || activeEvents.length === 0) return null;

        const voiceColors = ['#21cea3', '#fb923c'];

        return (
            <div className="d-flex flex-column" style={{ gap: '4px' }}>
                {activeEvents.map((ev, idx) => {
                    const color = voiceColors[(ev.voice - 1) % voiceColors.length] || voiceColors[0];
                    const notes = ev.isRest
                        ? [{ noteName: 'Rest' }]
                        : ev.processedPitches;

                    return (
                        <div key={idx} style={{ borderLeft: `3px solid ${color}`, paddingLeft: '10px', marginBottom: '2px' }}>
                            <div style={{ fontSize: '11px', color: '#8892b0', marginBottom: '2px' }}>
                                <span style={{ color }}>{ev.voice === 1 ? 'V1' : 'V2'}</span>
                                {!ev.isRest && <span style={{ marginLeft: '6px' }}>{getDurationLabel(ev.beatValue)}</span>}
                            </div>
                            {notes.map((p, pIdx) => (
                                <div key={pIdx} style={{ color, fontSize: '15px', fontWeight: '600', lineHeight: 1.4 }}>
                                    <span style={{ color: '#dfe6e9', fontWeight: '400' }}>
                                        {p.noteName}
                                        {p.string !== undefined && <span style={{ color: '#8892b0', fontSize: '12px', marginLeft: '6px' }}>s{p.string} f{p.fret}</span>}
                                    </span>
                                </div>
                            ))}
                            {ev.description && (
                                <div style={{ fontSize: '12px', color: '#aaccff', fontStyle: 'italic', marginTop: '1px', lineHeight: 1.3 }}>
                                    {ev.description}
                                </div>
                            )}
                        </div>
                    );
                })}
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
        <>
            <style>{`
                @keyframes countin-fade {
                    0% { opacity: 1; transform: translate(-50%, -50%) scale(1.3); }
                    100% { opacity: 0; transform: translate(-50%, -50%) scale(1); }
                }
            `}</style>
            <div
                className="d-flex flex-column bg-dark"
                style={{
                    height: 'calc(100vh - 20px)', // Takes up full screen height minus a small margin
                    overflow: 'hidden'             // Prevents the window scrollbar from appearing
                }}
            >
            <div className="bg-dark border-bottom border-secondary text-light p-2 sticky-top shrink-0 d-flex gap-2" style={{ height: 'auto' }}>

                <div className="d-flex flex-column gap-1" style={{ width: '215px', flexShrink: 0 }}>

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

                        {/* Line 2: Metronome and Sheet Music side-by-side */}
                        <div className="d-flex align-items-center gap-2">
                            <div className="d-flex align-items-center justify-content-between flex-grow-1" style={{ height: '18px' }}>
                                <span style={{
                                    fontSize: '10px',
                                    color: metronomeEnabled ? DARK_THEME.metronomeControlMedium : '#8892b0',
                                    fontWeight: 'bold'
                                }}>
                                    Met
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

                            <div className="d-flex align-items-center justify-content-center flex-grow-1 gap-0" style={{ height: '18px' }}>
                                {['tab','both','sheet'].map(m => (
                                    <button
                                        key={m}
                                        onClick={() => !isPlaying && setViewMode(m)}
                                        disabled={isPlaying}
                                        style={{
                                            fontSize: '10px',
                                            fontWeight: viewMode === m ? '700' : '400',
                                            color: viewMode === m ? '#fff' : '#8892b0',
                                            background: viewMode === m
                                                ? (m === 'tab' ? '#1a6b4a' : m === 'sheet' ? '#6b4a8a' : '#2a5a7a')
                                                : 'transparent',
                                            border: `1px solid ${viewMode === m ? 'transparent' : '#3a3a5a'}`,
                                            borderRadius: m === 'tab' ? '4px 0 0 4px' : m === 'sheet' ? '0 4px 4px 0' : '0',
                                            padding: '0 8px',
                                            lineHeight: '16px',
                                            cursor: isPlaying ? 'default' : 'pointer',
                                            opacity: isPlaying ? 0.5 : 1,
                                            transition: 'all 0.15s ease',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.3px'
                                        }}
                                    >
                                        {m === 'tab' ? 'Tab' : m === 'both' ? 'Both' : 'Staff'}
                                    </button>
                                ))}
                            </div>
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
                                            () => {},
                                            handleNoteClick,
                                            measuresPerRow,
                                            voice1Enabled && availableVoices.includes(1),
                                            voice2Enabled && availableVoices.includes(2),
                                            metronomeEnabled,
                                            viewMode
                                        )(row, index)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            </div>

                {countInBeat > 0 && (
                    <div
                        key={countInBeat}
                        style={{
                            position: 'fixed',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            fontSize: '140px',
                            color: 'rgba(167, 139, 250, 0.95)',
                            fontWeight: 'bold',
                            pointerEvents: 'none',
                            zIndex: 9999,
                            fontFamily: 'monospace',
                            textShadow: '0 0 40px rgba(167, 139, 250, 0.5)',
                            animation: 'countin-fade 0.8s ease-out forwards',
                        }}
                    >
                        {countInBeat}
                    </div>
                )}
            </div>
        </>
    );
}

