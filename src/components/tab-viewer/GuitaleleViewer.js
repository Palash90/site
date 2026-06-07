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
} from "././audio";
import { Table, Row, Col, Button, Form } from "react-bootstrap";

import { buildSvg } from "./svgUtils";
import { useBuildScoreLayout } from "./scoreBuilder";

export default function GuitaleleViewer({ scoreData }) {
    const [hoveredNoteIndex, setHoveredNoteIndex] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [playbackIndex, setPlaybackIndex] = useState(null);
    const [bpm, setBpm] = useState(100);
    const [slotWidth, setSlotWidth] = useState(45);
    const containerRef = useRef(null);
    const [isAudioCompiled, setIsAudioCompiled] = useState(false);

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


    const stopPlayback = stopPlaying(lookaheadTimerRef, playbackTimeoutsRef, setIsPlaying, setIsPaused, setPlaybackIndex, pausedTimeRef, audioCtxRef);

    const pausePlayback = pausePlaying(isPlaying, isPaused, lookaheadTimerRef, playbackTimeoutsRef, audioCtxRef, playbackStartTimeRef, pausedTimeRef, setIsPaused);

    const runSchedulerLoop = runScheduler(playbackStartBeatRef, audioCtxRef, bpm, playbackStartTimeRef, pausedTimeRef, nextBeatIndexRef, currentTimelineBeatsRef, scheduleAheadTime, setPlaybackIndex, playbackTimeoutsRef, stopPlayback, lookaheadTimerRef, lookaheadInterval);

    const resumePlayback = resumePlaying(isPlaying, isPaused, audioCtxRef, playbackStartTimeRef, setIsPaused, runSchedulerLoop);

    const startPlayback = startPlaying(isPlaying, scoreLayout, isAudioCompiled, audioCtxRef, setIsPlaying, setIsPaused, pausedTimeRef, playbackStartTimeRef, currentPlaybackEventsRef, playbackStartBeatRef, preCompiledTimelineRef, currentTimelineBeatsRef, nextBeatIndexRef, runSchedulerLoop);


    useEffect(() => {
        return () => stopPlayback();
    }, []);

    const activeTargetIndex = (isPlaying && !isPaused) ? playbackIndex : hoveredNoteIndex;

    // Replace `activeEvent` with `activeEvents` and `activeIndices`
    const activeEvents = useMemo(() => {
        if (activeTargetIndex === null || !scoreLayout) return [];

        const allEvents = scoreLayout.computedRows.flatMap(r => r.rowEvents);
        const targetEvent = allEvents.find(
            ev => ev.globalIndex === activeTargetIndex
        );

        if (!targetEvent) return [];

        // Fetch ALL events occurring at this exact measure and beat slice across all voices
        return allEvents.filter(
            ev =>
                ev.measureNumber === targetEvent.measureNumber &&
                ev.startBeat === targetEvent.startBeat
        );
    }, [activeTargetIndex, scoreLayout]);

    const activeIndices = useMemo(
        () => activeEvents.map(e => e.globalIndex),
        [activeEvents]
    );

    const activeDescription = useMemo(() => {
        if (!activeEvents || activeEvents.length === 0) return null;

        // 1. Extract and combine any custom input descriptions from the JSON first
        const customDescriptions = activeEvents
            .map(ev => ev.description)
            .filter(desc => typeof desc === "string" && desc.trim().length > 0);

        // De-duplicate custom messages if multiple voices shared the same reference string
        const uniqueCustomText = Array.from(new Set(customDescriptions)).join(
            " | "
        );

        // 2. Build the calculated voice pitch and rhythm data
        const voiceDetails = activeEvents
            .map(ev => {
                if (ev.isRest) {
                    return `Voice ${ev.voice}: Rest 𝄾 [${getDurationLabel(ev.beatValue).replace('note', 'rest')}]`;
                }

                const pitchDesc = ev.processedPitches
                    .map(p => `${p.noteName} (Str ${p.string}, Fr ${p.fret})`)
                    .join(" + ");

                return `Voice ${ev.voice}: ${pitchDesc} [${getDurationLabel(ev.beatValue)}]`;
            })
            .join("  ‖  ");

        // 3. Assemble components: Measure prefix + Input custom text (if any) + Generated technical values
        const measureNum = activeEvents[0].measureNumber;
        const baseHeader = `Measure ${measureNum}`;

        if (uniqueCustomText) {
            return `${baseHeader} • [${uniqueCustomText}] • ${voiceDetails}`;
        }

        return `${baseHeader} • ${voiceDetails}`;
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
                    top: Math.max(0, targetScrollTop - 4), // 4px padding for a clean aesthetic look
                    behavior: "smooth"
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
            <div className="bg-dark border-bottom border-secondary text-light p-2 sticky-top shrink-0">
                <Row className="align-items-center g-2">

                    {/* COLUMN 1: Audio Actions & Controls (Takes up 5/12 of the width) */}
                    <Col xs={12} md={5} className="d-flex align-items-center flex-wrap gap-2 border-end border-secondary">

                        {/* Clean Button Group for Play/Stop */}
                        <div className="btn-group bg-black p-1 rounded border border-secondary">
                            {!isPlaying ? (
                                <Button
                                    variant="link"
                                    onClick={startPlayback}
                                    className="text-success p-1"
                                    title="Start Playback"
                                >
                                    <svg className="bi" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                </Button>
                            ) : isPaused ? (
                                <Button
                                    variant="link"
                                    onClick={resumePlayback}
                                    className="text-warning p-1"
                                    title="Resume"
                                >
                                    <svg className="bi" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                </Button>
                            ) : (
                                <Button
                                    variant="link"
                                    onClick={pausePlayback}
                                    className="text-warning p-1"
                                    title="Pause"
                                >
                                    <svg className="bi" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                                </Button>
                            )}

                            <Button
                                variant="link"
                                onClick={stopPlayback}
                                disabled={!isPlaying}
                                className={`p-1 ${isPlaying ? 'text-danger' : 'text-muted'}`}
                                title="Stop Playback"
                            >
                                <svg className="bi" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h12v12H6z" /></svg>
                            </Button>
                        </div>

                        {/* Compact BPM Controller */}
                        <div className="d-flex align-items-center gap-2 bg-black px-2 py-1 rounded border border-secondary" style={{ fontSize: '12px' }}>
                            <span className="text-muted fw-bold font-monospace">BPM</span>
                            <span className="text-warning fw-bold font-monospace" style={{ minWidth: '24px', textAlign: 'center' }}>{bpm}</span>
                            <Form.Range
                                min="40"
                                max="240"
                                value={bpm}
                                onChange={(e) => setBpm(parseInt(e.target.value, 10))}
                                className="mx-1"
                                style={{ width: '80px' }}
                                disabled={isPlaying}
                            />
                        </div>
                    </Col>

                    {/* COLUMN 2: Scrollable Note Text (Takes up 7/12 of the width) */}
                    <Col xs={12} md={7}>
                        <div
                            className="bg-black border border-secondary rounded p-2 text-info font-monospace"
                            style={{
                                height: '42px',
                                overflowY: 'auto',
                                fontSize: '12px',
                                lineHeight: '1.2'
                            }}
                        >
                            {activeDescription ? (
                                <span>🎵 {activeDescription}</span>
                            ) : (
                                <span className="text-muted fst-italic">
                                    Hover over or tap notes below to read real-time properties.
                                </span>
                            )}
                        </div>
                    </Col>

                </Row>
            </div>

            {/* 3. THE TRUE SCROLL VIEWPORT: Only things inside this box will move or scroll */}
            <div
                ref={containerRef}
                className="flex-grow-1"
                style={{
                    overflowY: 'auto',
                    paddingTop: '12px',
                    paddingBottom: '150px', // Extra padding at bottom so the final row rhythm lane is accessible
                    backgroundColor: '#090d16' // Matches DARK_THEME bgPage/bgScore look
                }}
            >
                <Table responsive bordered={false} style={{ margin: 0, width: '100%' }}>
                    <tbody>
                        {computedRows.map((row, index) => {
                            // Dynamically adjust padding between layout lines based on screen real estate profile
                            const rowPaddingBottom = measuresPerRow === 1 ? '16px' : measuresPerRow === 2 ? '32px' : '60px';

                            return (
                                <tr key={index}>
                                    <td style={{ border: 'none', padding: `0 12px ${rowPaddingBottom} 12px` }}>
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
                                            measuresPerRow // <-- Pass the configuration parameter down
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


