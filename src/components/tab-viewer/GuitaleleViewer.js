import React, { useState, useMemo, useRef, useEffect } from "react";
import { playHumanizedGuitaleleNote, TUNING } from "./audio";
import {
    DARK_THEME,
    RHYTHM_BEAT_VALUES,
    calculateSchedulerBoundaries,
    NOTE_NAMES,
    getDurationLabel,
    getFlagPath,
    parsePitchProperties,
    fixedTopRightStyle,
    outerContainerStyle,
    scrollableContentStyle
} from "./guitaleleViewerUtils";

import {
    stopPlaying,
    pausePlaying,
    resumePlaying,
    startPlaying,
    runScheduler
} from "././audio";

import { buildSvg } from "./svgUtils";

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

    const scoreLayout = useMemo(() => {
        // 1. Updated guard clause to check for the 'measures' array
        if (!scoreData || !scoreData.measures) return null;

        const paddingX = 140;
        const lineSpacing = 20;
        const trebleTopY = 150;
        const bassTopY = 280;
        const tabTopY = 400;
        const rhythmTopY = 640;
        const svgHeight = 750;

        const timeSigTop = scoreData.timeSignature?.split("/")[0] || "4";
        const timeSigBottom = scoreData.timeSignature?.split("/")[1] || "4";
        const numerator = parseInt(timeSigTop, 10);
        const denominator = parseInt(timeSigBottom, 10);
        const beatsPerMeasure = numerator * (4 / denominator);

        const SLOT_WIDTH = slotWidth;
        const MEASURE_PADDING = 35;

        let processedEvents = [];
        let absoluteMeasureStartBeat = 0;
        let globalEventIndex = 0; // Tracks the ID for playback/hover highlighting across measures

        // Loop through isolated measure containers
        scoreData.measures.forEach(measure => {
            const mNum = measure.measureNumber;
            let localCursors = { 1: 0, 2: 0 };

            // We'll use a temporary map for this measure to merge notes sharing the same startBeat and voice
            const beatMergeMap = {};

            measure.notes.forEach(event => {
                let detectedRhythm = event.rhythm;
                let pitches = event.pitches || [];

                if (
                    !event.pitches &&
                    event.fret !== undefined &&
                    event.string !== undefined
                ) {
                    pitches = [{ fret: event.fret, string: event.string }];
                }

                const uniqueStringsMap = {};
                pitches.forEach(p => {
                    if (
                        uniqueStringsMap[p.string] === undefined ||
                        p.fret > uniqueStringsMap[p.string].fret
                    ) {
                        uniqueStringsMap[p.string] = p;
                    }
                });
                pitches = Object.values(uniqueStringsMap);

                const isRestEvent = pitches.length === 0 && !event.tie;

                if (!detectedRhythm && event.duration !== undefined) {
                    if (isRestEvent) {
                        if (event.duration === 1.5) detectedRhythm = "r.";
                        else if (event.duration === 1.0) detectedRhythm = "r";
                        else if (event.duration === 0.5) detectedRhythm = "r+";
                        else if (event.duration === 0.25) detectedRhythm = "r=";
                    } else {
                        if (event.duration === 6.0) detectedRhythm = "o.";
                        else if (event.duration === 4.0) detectedRhythm = "o";
                        else if (event.duration === 3.0) detectedRhythm = "..";
                        else if (event.duration === 2.0) detectedRhythm = ".";
                        else if (event.duration === 1.5) detectedRhythm = ":.";
                        else if (event.duration === 1.0) detectedRhythm = ":";
                        else if (event.duration === 0.75) detectedRhythm = "+.";
                        else if (event.duration === 0.5) detectedRhythm = "+";
                        else if (event.duration === 0.25) detectedRhythm = "=";
                    }
                }

                const beatValue =
                    event.duration !== undefined
                        ? event.duration
                        : RHYTHM_BEAT_VALUES[detectedRhythm || ":"] || 1.0;
                const voice = event.voice || 1;
                const startBeat =
                    absoluteMeasureStartBeat + localCursors[voice];

                localCursors[voice] += beatValue;

                // Create a unique key for this specific beat location per voice
                const mergeKey = `${voice}_${startBeat}`;

                if (!beatMergeMap[mergeKey]) {
                    // Initialize the unique entry for this beat
                    beatMergeMap[mergeKey] = {
                        ...event,
                        pitches: [...pitches],
                        descriptions: event.description
                            ? [event.description]
                            : [],
                        rhythm: detectedRhythm || (isRestEvent ? "r" : ":"),
                        beatValue,
                        isRest:
                            isRestEvent ||
                            (detectedRhythm && detectedRhythm.startsWith("r")),
                        voice,
                        startBeat,
                        measureNumber: mNum,
                        isTiedToNext: !!event.tie
                    };
                } else {
                    // If a note already exists on this exact beat, combine its properties!
                    // 1. Merge pitches arrays seamlessly
                    beatMergeMap[mergeKey].pitches = [
                        ...beatMergeMap[mergeKey].pitches,
                        ...pitches
                    ];

                    // 2. Accumulate descriptions instead of overwriting
                    if (event.description) {
                        beatMergeMap[mergeKey].descriptions.push(
                            event.description
                        );
                    }

                    // 3. Ensure tie states carry over
                    if (event.tie) {
                        beatMergeMap[mergeKey].isTiedToNext = true;
                    }
                }
            });

            // Push the merged beats into our processedEvents array
            Object.values(beatMergeMap).forEach(mergedEvent => {
                // Join descriptions array into a clean single string for your UI display components
                if (
                    mergedEvent.descriptions &&
                    mergedEvent.descriptions.length > 0
                ) {
                    mergedEvent.description =
                        mergedEvent.descriptions.join(" | ");
                } else if (!mergedEvent.description) {
                    mergedEvent.description = "";
                }

                // De-duplicate any pitch collisions on identical strings if multiple notes collided
                const finalPitchesMap = {};
                mergedEvent.pitches.forEach(p => {
                    if (
                        finalPitchesMap[p.string] === undefined ||
                        p.fret > finalPitchesMap[p.string].fret
                    ) {
                        finalPitchesMap[p.string] = p;
                    }
                });
                mergedEvent.pitches = Object.values(finalPitchesMap);

                processedEvents.push({
                    ...mergedEvent,
                    globalIndex: globalEventIndex++
                });
            });

            absoluteMeasureStartBeat += beatsPerMeasure;
        });

        // Calculate total measures based directly on the JSON structure
        const totalMeasures =
            scoreData.measures.length > 0
                ? Math.max(...scoreData.measures.map(m => m.measureNumber))
                : 1;

        // 3. Build validity and polyphony checks early
        const measureValidityMap = {};
        for (let m = 1; m <= totalMeasures; m++) {
            const evs1 = processedEvents.filter(
                ev => ev.measureNumber === m && ev.voice === 1
            );
            const evs2 = processedEvents.filter(
                ev => ev.measureNumber === m && ev.voice === 2
            );

            const sum1 = evs1.reduce((s, e) => s + (e.beatValue || 0), 0);
            const sum2 = evs2.reduce((s, e) => s + (e.beatValue || 0), 0);

            const present1 = evs1.length > 0;
            const present2 = evs2.length > 0;

            const valid1 = present1
                ? Math.abs(sum1 - beatsPerMeasure) < 1e-6
                : true;
            const valid2 = present2
                ? Math.abs(sum2 - beatsPerMeasure) < 1e-6
                : true;

            measureValidityMap[m] = {
                sum1,
                sum2,
                present1,
                present2,
                valid1,
                valid2,
                valid: valid1 && valid2,
                isPolyphonic: present1 && present2 // Tracks if this specific measure needs dual-voice formatting
            };
        }

        const measureTimeSlotsMap = {};
        processedEvents.forEach(ev => {
            if (!measureTimeSlotsMap[ev.measureNumber]) {
                measureTimeSlotsMap[ev.measureNumber] = new Set();
            }
            measureTimeSlotsMap[ev.measureNumber].add(ev.startBeat);
        });

        const measureSortedSlots = {};
        Object.keys(measureTimeSlotsMap).forEach(mNum => {
            measureSortedSlots[mNum] = Array.from(
                measureTimeSlotsMap[mNum]
            ).sort((a, b) => a - b);
        });

        const computedRows = [];

        for (let i = 0; i < totalMeasures; i += measuresPerRow) {
            const rowMeasuresCount = Math.min(
                measuresPerRow,
                totalMeasures - i
            );

            const barlineXPositions = [];
            const measureGroups = [];
            let currentXPointer = paddingX;

            for (let j = 0; j < rowMeasuresCount; j++) {
                const measureNum = i + j + 1;
                const uniqueSlotsCount =
                    measureSortedSlots[measureNum]?.length || 1;

                const mWidth =
                    uniqueSlotsCount * SLOT_WIDTH + MEASURE_PADDING * 2;
                const startX = currentXPointer;
                const endX = startX + mWidth;

                measureGroups.push({
                    measureNumber: measureNum,
                    startX: startX,
                    endX: endX,
                    slotsArray: measureSortedSlots[measureNum] || []
                });

                currentXPointer = endX;
                barlineXPositions.push(endX);
            }

            const rowEndX = currentXPointer;
            const TOTAL_SVG_WIDTH = rowEndX + 40;

            const rowEvents = processedEvents
                // 4. Safely filter notes into rows using measure number, not float beats
                .filter(
                    ev =>
                        ev.measureNumber > i &&
                        ev.measureNumber <= i + rowMeasuresCount
                )
                .map(ev => {
                    const mGroup = measureGroups.find(
                        g => g.measureNumber === ev.measureNumber
                    );
                    const slotIndex = mGroup.slotsArray.indexOf(ev.startBeat);
                    const cx =
                        mGroup.startX +
                        MEASURE_PADDING +
                        slotIndex * SLOT_WIDTH +
                        SLOT_WIDTH / 2;

                    const processedPitches = ev.pitches.map(p => {
                        const tabY = tabTopY + (p.string - 1) * lineSpacing;
                        const midi = TUNING[p.string].baseMidi + p.fret;
                        const clef = midi >= 60 ? "treble" : "bass";
                        const clefTopY =
                            clef === "treble" ? trebleTopY : bassTopY;
                        const pitchProps = parsePitchProperties(
                            midi,
                            clef,
                            clefTopY,
                            lineSpacing
                        );
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

                    const treblePitches = processedPitches.filter(
                        p => p.clef === "treble"
                    );
                    const bassPitches = processedPitches.filter(
                        p => p.clef === "bass"
                    );

                    const isPolyphonicMeasure =
                        measureValidityMap[ev.measureNumber]?.isPolyphonic;

                    const computeStaffStemData = (pitches, midLineMidi) => {
                        if (pitches.length === 0) return null;
                        const staffYs = pitches.map(p => p.staffY);
                        const lowestY = Math.max(...staffYs);
                        const highestY = Math.min(...staffYs);
                        const avgMidi =
                            pitches.reduce((sum, p) => sum + p.midi, 0) /
                            pitches.length;

                        // 5. Stem direction correctly flips only if the local measure has two voices
                        let stemDown = avgMidi >= midLineMidi;
                        if (isPolyphonicMeasure) stemDown = ev.voice === 2;

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

            computedRows.push({
                rowEvents,
                totalWidth: TOTAL_SVG_WIDTH,
                barlineXPositions,
                measureGroups,
                rowEndX
            });
        }

        return {
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
        };
    }, [scoreData, measuresPerRow]);

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
            // Find the active SVG node or highlighted element container
            const activeNode = document.querySelector(
                `rect[fill="${DARK_THEME.fillHoverHighlight}"]`
            );
            if (activeNode && containerRef.current) {
                const nodeRect = activeNode.getBoundingClientRect();
                const isBelow = nodeRect.bottom > window.innerHeight - 60;
                const isAbove = nodeRect.top < 180; // Adjusted offset to clear the sticky overlay cont

                if (isBelow || isAbove) {
                    activeNode.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
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
        <div style={{ ...outerContainerStyle, height: svgHeight + 80 + "px" }}>
            <div style={fixedTopRightStyle}>
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
                                        onClick={
                                            isPaused
                                                ? resumePlayback
                                                : pausePlayback
                                        }
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

            <div ref={containerRef} style={scrollableContentStyle}>
                {computedRows.map(
                    buildSvg(svgHeight, paddingX, trebleTopY, bassTopY, lineSpacing, timeSigTop, timeSigBottom, tabTopY, measureValidityMap, rhythmTopY, beatsPerMeasure, activeIndices, rhythm2TopY, rhythm1TopY, SLOT_WIDTH, isPlaying, setHoveredNoteIndex)
                )}
            </div>
        </div>
    );
}
