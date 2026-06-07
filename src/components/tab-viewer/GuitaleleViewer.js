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
import { Table } from "react-bootstrap";

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
                setMeasuresPerRow(1); // Small mobile layout profile
                setSlotWidth(35);
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
                if (ev.isRest) return;

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

    const activeTargetIndex = isPlaying ? playbackIndex : hoveredNoteIndex;

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
                    return `Voice ${ev.voice}: Rest 𝄾 [${getDurationLabel(ev.beatValue)}]`;
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

    useEffect(() => {
        if (isPlaying && playbackIndex !== null) {
            // 1. Target the highlighted visual node element
            const activeNode = document.querySelector(
                `rect[fill="${DARK_THEME.fillHoverHighlight}"]`
            );
            const scrollContainer = containerRef.current;

            if (activeNode && scrollContainer) {
                const containerRect = scrollContainer.getBoundingClientRect();
                const nodeRect = activeNode.getBoundingClientRect();

                // 2. Determine if the active row is starting to clip out of view
                const isBelow = nodeRect.bottom > containerRect.bottom - 40;
                const isAbove = nodeRect.top < containerRect.top + 40;

                if (isBelow || isAbove) {
                    // 3. Compute target position relative inside the container
                    const relativeNodeTop = nodeRect.top - containerRect.top + scrollContainer.scrollTop;
                    const targetScrollTop = relativeNodeTop - (containerRect.height / 2) + (nodeRect.height / 2);

                    // 4. Safely shift only the inner viewport
                    scrollContainer.scrollTo({
                        top: targetScrollTop,
                        behavior: "smooth"
                    });
                }
            }
        }
    }, [playbackIndex, isPlaying]);

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
        svgHeight,
        lineSpacing,
        SLOT_WIDTH,
        measureValidityMap,
        beatsPerMeasure
    } = scoreLayout;

    const rhythm1TopY = rhythmTopY;
    const rhythm2TopY = rhythmTopY + 28;

    return (
        <div
            style={{
                height: `${svgHeight + 80}px`,
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#0f172a', // Slate-900 dark theme
                overflow: 'hidden' // Prevents the outer container from scrolling
            }}
        >
            {/* 2. THE LOCKED HEADER: Completely isolated from the scroll mechanics */}
            <div
                style={{
                    flexShrink: 0, // Prevents JavaScript or long tables from shrinking this header
                    zIndex: 50,
                    backgroundColor: '#0f172a',
                    padding: '16px 24px 12px 24px'
                }}
            >
                <div className="max-w-6xl mx-auto flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            {!isPlaying ? (
                                <button
                                    onClick={() => startPlayback(1)}
                                    disabled={!isAudioCompiled}
                                    className={`px-5 py-2 rounded-lg text-xs font-mono font-bold tracking-wide text-white transition-all ${isAudioCompiled
                                        ? "bg-emerald-600 hover:bg-emerald-500 cursor-pointer"
                                        : "bg-slate-700 opacity-60 cursor-not-allowed"
                                        }`}
                                >
                                    {isAudioCompiled
                                        ? "▶ START PLAYBACK"
                                        : "⏳ COMPILING SCORE..."}
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={isPaused ? resumePlayback : pausePlayback}
                                        className={`px-5 py-2 rounded-lg text-xs font-mono font-bold tracking-wide text-white transition-all ${isPaused
                                            ? "bg-amber-600 hover:bg-amber-500"
                                            : "bg-indigo-600 hover:bg-indigo-500"
                                            }`}
                                    >
                                        {isPaused ? "▶ RESUME" : "⏸ PAUSE"}
                                    </button>
                                    <button
                                        onClick={stopPlayback}
                                        className="px-5 py-2 rounded-lg text-xs font-mono font-bold tracking-wide bg-rose-600 text-white hover:bg-rose-500 transition-all"
                                    >
                                        ⏹ STOP
                                    </button>
                                </>
                            )}
                        </div>

                        <div className="text-[10px] bg-slate-950 px-3 py-1.5 rounded text-slate-400 font-mono tracking-wider">
                            LAYOUT Profile:{" "}
                            <span className="text-cyan-400 font-bold">
                                {measuresPerRow} MEASURES / ROW
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 pt-2 border-t border-slate-800/60">
                        <span className="text-xs font-mono text-slate-400 whitespace-nowrap min-w-[90px]">
                            TEMPO: {bpm} BPM
                        </span>
                        <div className="flex-1 flex items-center">
                            <input
                                type="range"
                                min="60"
                                max="240"
                                value={bpm}
                                disabled={isPlaying}
                                onChange={e => setBpm(parseInt(e.target.value))}
                                className="w-full h-2 accent-cyan-400 bg-slate-950 rounded-lg cursor-pointer disabled:opacity-30"
                            />
                        </div>
                    </div>

                    <div className="h-4 flex items-center justify-center pt-0.5 text-center">
                        {activeDescription ? (
                            <span className="text-[11px] font-mono text-cyan-400 font-semibold tracking-wide animate-pulse">
                                🎵 {activeDescription}
                            </span>
                        ) : (
                            <span className="text-[11px] font-mono text-slate-500 italic tracking-wide">
                                Hover over or tap a note lane or tap segments
                                below to read real-time properties.
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* 3. THE TRUE SCROLL VIEWPORT: Only things inside this box will move or scroll */}
            <div
                ref={containerRef}
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    paddingTop: '8px'
                }}
            >
                <Table responsive bordered={false} style={{ margin: 0, width: '100%' }}>
                    <tbody>
                        {computedRows.map((row, index) => (
                            <tr key={index}>
                                <td style={{ border: 'none', padding: 0 }}>
                                    {buildSvg(svgHeight, paddingX, trebleTopY, bassTopY, lineSpacing, timeSigTop, timeSigBottom, tabTopY, measureValidityMap, rhythmTopY, beatsPerMeasure, activeIndices, rhythm2TopY, rhythm1TopY, SLOT_WIDTH, isPlaying, setHoveredNoteIndex)(row, index)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
        </div>
    );
}


