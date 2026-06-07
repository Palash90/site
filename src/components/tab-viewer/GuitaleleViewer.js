import React, { useState, useMemo, useRef, useEffect } from "react";
import { playHumanizedGuitaleleNote, TUNING } from "./audio";
import { DARK_THEME, RHYTHM_BEAT_VALUES, calculateSchedulerBoundaries, NOTE_NAMES, getDurationLabel, getFlagPath, parsePitchProperties } from "./guitaleleViewerUtils";

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

    const stopPlayback = () => {
        if (lookaheadTimerRef.current) {
            clearTimeout(lookaheadTimerRef.current);
            lookaheadTimerRef.current = null;
        }
        playbackTimeoutsRef.current.forEach(t => clearTimeout(t));
        playbackTimeoutsRef.current = [];

        setIsPlaying(false);
        setIsPaused(false);
        setPlaybackIndex(null);
        pausedTimeRef.current = 0;

        if (audioCtxRef.current) {
            audioCtxRef.current.close();
            audioCtxRef.current = null;
        }
    };

    const pausePlayback = () => {
        if (!isPlaying || isPaused) return;

        if (lookaheadTimerRef.current) {
            clearTimeout(lookaheadTimerRef.current);
            lookaheadTimerRef.current = null;
        }
        playbackTimeoutsRef.current.forEach(t => clearTimeout(t));
        playbackTimeoutsRef.current = [];

        const elapsedSec =
            audioCtxRef.current.currentTime - playbackStartTimeRef.current;
        pausedTimeRef.current += elapsedSec;

        setIsPaused(true);
        if (audioCtxRef.current) {
            audioCtxRef.current.suspend();
        }
    };

    const resumePlayback = () => {
        if (!isPlaying || !isPaused) return;

        if (audioCtxRef.current) {
            audioCtxRef.current.resume();
            playbackStartTimeRef.current = audioCtxRef.current.currentTime;
            setIsPaused(false);

            runSchedulerLoop();
        }
    };

    const startPlayback = (fromMeasure = 1) => {
        if (isPlaying || !scoreLayout || !isAudioCompiled) return;

        // Sync hook initiation for mobile WebKit audio focus
        if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
            audioCtxRef.current = new (
                window.AudioContext || window.webkitAudioContext
            )();
        }

        setIsPlaying(true);
        setIsPaused(false);
        pausedTimeRef.current = 0;
        playbackStartTimeRef.current = audioCtxRef.current.currentTime;

        const allEvents = scoreLayout.computedRows.flatMap(r => r.rowEvents);
        const targetedEvents = allEvents.filter(
            ev => ev.measureNumber >= fromMeasure
        );

        currentPlaybackEventsRef.current = targetedEvents;
        const startOffsetBeat =
            targetedEvents.length > 0 ? targetedEvents[0].startBeat : 0;
        playbackStartBeatRef.current = startOffsetBeat;

        // Group our precompiled notes by their exact startBeat timestamp
        const notesForRun = preCompiledTimelineRef.current.filter(
            n => n.startBeat >= startOffsetBeat
        );

        // Create an ordered timeline map of unique beat moments
        const uniqueBeatsMap = {};
        notesForRun.forEach(note => {
            if (!uniqueBeatsMap[note.startBeat]) {
                uniqueBeatsMap[note.startBeat] = {
                    startBeat: note.startBeat,
                    globalIndex: note.globalIndex, // Map to layout position for UI highlights
                    notes: []
                };
            }
            uniqueBeatsMap[note.startBeat].notes.push(note);
        });

        // Sort chronologically
        currentTimelineBeatsRef.current = Object.values(uniqueBeatsMap).sort(
            (a, b) => a.startBeat - b.startBeat
        );
        nextBeatIndexRef.current = 0;

        runSchedulerLoop(startOffsetBeat);
    };

    const runSchedulerLoop = (startOffsetBeat = null) => {
        const offsetBeat =
            startOffsetBeat !== null
                ? startOffsetBeat
                : playbackStartBeatRef.current;
        const ctx = audioCtxRef.current;
        const beatDurationSeconds = 60 / bpm;
        const scheduleOffsetSec = 0.2; // Increased to 200ms to allow smooth audio connection on slow screens

        const scheduleTimelineChunk = () => {
            if (!ctx || ctx.state === "closed") return;

            const absoluteCurrentPlaybackTime =
                ctx.currentTime -
                playbackStartTimeRef.current +
                pausedTimeRef.current;

            // --- REPLACE INSIDE scheduleTimelineChunk() WITHIN runSchedulerLoop() ---
            while (
                nextBeatIndexRef.current <
                currentTimelineBeatsRef.current.length
            ) {
                const beatSlice =
                    currentTimelineBeatsRef.current[nextBeatIndexRef.current];
                const eventAbsoluteSec =
                    (beatSlice.startBeat - offsetBeat) * beatDurationSeconds;

                if (
                    eventAbsoluteSec <
                    absoluteCurrentPlaybackTime + scheduleAheadTime
                ) {
                    const fallbackNote = beatSlice.notes[0];
                    const jitter = fallbackNote
                        ? fallbackNote.preCalculatedJitter
                        : 0;
                    const finalPluckTime =
                        playbackStartTimeRef.current -
                        pausedTimeRef.current +
                        scheduleOffsetSec +
                        eventAbsoluteSec +
                        jitter;

                    // 1. Dispatch audio nodes instantly to the Web Audio timeline queue
                    beatSlice.notes.forEach(note => {
                        const runtimeSegments = note.segments.map(seg => ({
                            ...seg,
                            duration: seg.duration * beatDurationSeconds
                        }));

                        playHumanizedGuitaleleNote(
                            ctx,
                            runtimeSegments,
                            finalPluckTime,
                            null,
                            note.type === "mute"
                                ? 0
                                : note.preCalculatedVelocity
                        );
                    });

                    // 2. High-precision visual state synchronization tracking
                    const timeUntilVisualMs = Math.max(
                        0,
                        (eventAbsoluteSec -
                            absoluteCurrentPlaybackTime +
                            scheduleOffsetSec) *
                        1000
                    );
                    const visualTimeout = setTimeout(() => {
                        setPlaybackIndex(beatSlice.globalIndex);
                    }, timeUntilVisualMs);

                    playbackTimeoutsRef.current.push(visualTimeout);
                    beatSlice.notes.forEach(note => {
                        note.segments.forEach(seg => {
                            if (seg.tiedEventIndices) {
                                seg.tiedEventIndices.forEach(tiedEvent => {
                                    const tiedAbsoluteSec =
                                        eventAbsoluteSec +
                                        tiedEvent.beatOffset *
                                        beatDurationSeconds;
                                    const timeUntilTiedVisualMs = Math.max(
                                        0,
                                        (tiedAbsoluteSec -
                                            absoluteCurrentPlaybackTime +
                                            scheduleOffsetSec) *
                                        1000
                                    );

                                    const tiedVisualTimeout = setTimeout(() => {
                                        setPlaybackIndex(tiedEvent.globalIndex);
                                    }, timeUntilTiedVisualMs);

                                    playbackTimeoutsRef.current.push(
                                        tiedVisualTimeout
                                    );
                                });
                            }
                        });
                    });
                    nextBeatIndexRef.current++;
                } else {
                    break;
                }
            }

            // End tracking termination
            if (
                nextBeatIndexRef.current >=
                currentTimelineBeatsRef.current.length
            ) {
                const lastSlice =
                    currentTimelineBeatsRef.current[
                    currentTimelineBeatsRef.current.length - 1
                    ];
                if (lastSlice) {
                    const maxSustainBeats = Math.max(
                        ...lastSlice.notes.map(n =>
                            n.segments.reduce((acc, s) => acc + s.duration, 0)
                        ),
                        1.0
                    );

                    const totalDurationSec =
                        (lastSlice.startBeat - offsetBeat + maxSustainBeats) *
                        beatDurationSeconds;
                    const timeUntilEndMs =
                        (totalDurationSec -
                            absoluteCurrentPlaybackTime +
                            scheduleOffsetSec) *
                        1000;

                    const endTimeout = setTimeout(
                        () => {
                            stopPlayback();
                        },
                        Math.max(0, timeUntilEndMs)
                    );
                    playbackTimeoutsRef.current.push(endTimeout);
                }
                return;
            }

            lookaheadTimerRef.current = setTimeout(
                scheduleTimelineChunk,
                lookaheadInterval
            );
        };

        scheduleTimelineChunk();
    };

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

    const outerContainerStyle = {
        position: "relative", // Establishes boundary for absolute positioning
        width: "100%", // Adapts to wherever you drop it in the page
        height: svgHeight + "px", // Constrained height so it knows when to scroll
        overflow: "hidden", // Prevents content from breaking outside the box
        border: "1px solid #ccc",
        boxSizing: "border-box"
    };

    const fixedTopRightStyle = {
        position: "absolute",
        top: "10px",
        right: "10px",
        zIndex: 100,

        // The changes:
        width: "20%" /* Set your exact desired width here */,
        boxSizing: "border-box" /* Keeps padding from breaking the width */,

        padding: "8px 12px",
        borderRadius: "4px",
        pointerEvents: "auto"
    };

    const scrollableContentStyle = {
        width: "70%",

        // The changes:
        height: "60vh" /* Forces the container to exactly 55% of the viewport height */,
        overflowY: "auto" /* Enables scrolling when content exceeds 55vh */,

        paddingTop: "60px",
        paddingLeft: "20px",
        paddingRight: "20px",
        paddingBottom: "20px",
        boxSizing: "border-box"
    };

    return (
        <div style={outerContainerStyle}>
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
                    (
                        {
                            rowEvents,
                            totalWidth,
                            barlineXPositions,
                            measureGroups,
                            rowEndX
                        },
                        rowIdx
                    ) => {
                        return (
                            <div
                                key={`row-${rowIdx}`}
                                className={`${DARK_THEME.bgScore} ${DARK_THEME.borderScore} border rounded-lg shadow-xl p-4 w-full overflow-x-auto flex justify-center`}
                            >
                                <svg
                                    viewBox={`0 0 ${totalWidth} ${svgHeight}`}
                                    style={{
                                        width: `${totalWidth}px`,
                                        maxWidth: "100%",
                                        height: `${svgHeight * 0.9}px`,
                                        maxHeight: "none"
                                    }}
                                    className="select-none block shrink-0"
                                >
                                    <defs>
                                        <filter
                                            id="note-glow"
                                            x="-50%"
                                            y="-50%"
                                            width="200%"
                                            height="200%"
                                        >
                                            <feGaussianBlur
                                                stdDeviation="3"
                                                result="blur"
                                            />
                                            <feMerge>
                                                <feMergeNode in="blur" />
                                                <feMergeNode in="SourceGraphic" />
                                            </feMerge>
                                        </filter>
                                    </defs>

                                    <path
                                        d={`M ${paddingX - 115} ${trebleTopY} L ${paddingX - 122} ${trebleTopY} L ${paddingX - 122} ${bassTopY + 4 * lineSpacing} L ${paddingX - 115} ${bassTopY + 4 * lineSpacing}`}
                                        fill="none"
                                        stroke={DARK_THEME.lineStaff}
                                        strokeWidth="2.5"
                                    />

                                    {[0, 1, 2, 3, 4].map(i => (
                                        <line
                                            key={`treble-${i}`}
                                            x1={paddingX}
                                            y1={trebleTopY + i * lineSpacing}
                                            x2={rowEndX}
                                            y2={trebleTopY + i * lineSpacing}
                                            stroke={DARK_THEME.lineStaff}
                                            strokeWidth="1"
                                        />
                                    ))}
                                    <text
                                        x={paddingX - 105}
                                        y={trebleTopY + 3.5 * lineSpacing}
                                        className="text-4xl font-serif"
                                        fill={DARK_THEME.textClef}
                                    >
                                        𝄞
                                    </text>

                                    {[0, 1, 2, 3, 4].map(i => (
                                        <line
                                            key={`bass-${i}`}
                                            x1={paddingX}
                                            y1={bassTopY + i * lineSpacing}
                                            x2={rowEndX}
                                            y2={bassTopY + i * lineSpacing}
                                            stroke={DARK_THEME.lineStaff}
                                            strokeWidth="1"
                                        />
                                    ))}
                                    <text
                                        x={paddingX - 105}
                                        y={bassTopY + 3.2 * lineSpacing}
                                        className="text-4xl font-serif"
                                        fill={DARK_THEME.textClef}
                                    >
                                        𝄢
                                    </text>

                                    <g
                                        className="font-serif font-black text-2xl text-center"
                                        fill={DARK_THEME.textTimeSig}
                                        transform={`translate(${paddingX - 55}, 0)`}
                                    >
                                        <text
                                            x="0"
                                            y={trebleTopY + 16}
                                            textAnchor="middle"
                                        >
                                            {timeSigTop}
                                        </text>
                                        <text
                                            x="0"
                                            y={trebleTopY + 42}
                                            textAnchor="middle"
                                        >
                                            {timeSigBottom}
                                        </text>
                                        <text
                                            x="0"
                                            y={bassTopY + 16}
                                            textAnchor="middle"
                                        >
                                            {timeSigTop}
                                        </text>
                                        <text
                                            x="0"
                                            y={bassTopY + 42}
                                            textAnchor="middle"
                                        >
                                            {timeSigBottom}
                                        </text>
                                        <text
                                            x="0"
                                            y={tabTopY + 24}
                                            textAnchor="middle"
                                            className="text-xl font-sans font-bold"
                                            fill={DARK_THEME.textTabLabel}
                                        >
                                            {timeSigTop}
                                        </text>
                                        <text
                                            x="0"
                                            y={tabTopY + 54}
                                            textAnchor="middle"
                                            className="text-xl font-sans font-bold"
                                            fill={DARK_THEME.textTabLabel}
                                        >
                                            {timeSigBottom}
                                        </text>
                                    </g>

                                    {[0, 1, 2, 3, 4, 5].map(i => (
                                        <line
                                            key={`t-l-${i}`}
                                            x1={paddingX}
                                            y1={tabTopY + i * lineSpacing}
                                            x2={rowEndX}
                                            y2={tabTopY + i * lineSpacing}
                                            stroke={DARK_THEME.lineTab}
                                            strokeWidth="1.2"
                                        />
                                    ))}
                                    <g
                                        transform={`translate(${paddingX - 105}, ${tabTopY + 12})`}
                                        fill={DARK_THEME.textTabLabel}
                                        className="font-black tracking-tighter text-xs"
                                    >
                                        <text x="0" y="0">
                                            T
                                        </text>
                                        <text x="0" y="14">
                                            A
                                        </text>
                                        <text x="0" y="28">
                                            B
                                        </text>
                                    </g>
                                    {[0, 1, 2, 3, 4, 5].map(i => (
                                        <text
                                            key={`string-${i}`}
                                            x={paddingX - 15}
                                            y={tabTopY + i * lineSpacing + 4}
                                            textAnchor="end"
                                            className="text-[9px] font-bold"
                                            fill={DARK_THEME.textTabString}
                                        >
                                            {i + 1}
                                        </text>
                                    ))}

                                    <line
                                        x1={paddingX}
                                        y1={trebleTopY}
                                        x2={paddingX}
                                        y2={bassTopY + 4 * lineSpacing}
                                        stroke={DARK_THEME.lineBar}
                                        strokeWidth="2"
                                    />
                                    <line
                                        x1={paddingX}
                                        y1={tabTopY}
                                        x2={paddingX}
                                        y2={tabTopY + 5 * lineSpacing}
                                        stroke={DARK_THEME.lineTab}
                                        strokeWidth="2"
                                    />

                                    {barlineXPositions.map((barX, i) => (
                                        <g key={`barline-${i}`}>
                                            <line
                                                x1={barX}
                                                y1={trebleTopY}
                                                x2={barX}
                                                y2={bassTopY + 4 * lineSpacing}
                                                stroke={DARK_THEME.lineBar}
                                                strokeWidth={
                                                    i ===
                                                        barlineXPositions.length - 1
                                                        ? "2"
                                                        : "1.6"
                                                }
                                            />
                                            <line
                                                x1={barX}
                                                y1={tabTopY}
                                                x2={barX}
                                                y2={tabTopY + 5 * lineSpacing}
                                                stroke={DARK_THEME.lineTab}
                                                strokeWidth={
                                                    i ===
                                                        barlineXPositions.length - 1
                                                        ? "2"
                                                        : "1.6"
                                                }
                                            />
                                        </g>
                                    ))}

                                    {measureGroups.map(measure => {
                                        const measureCenterX =
                                            (measure.startX + measure.endX) / 2;
                                        const mv =
                                            measureValidityMap?.[
                                            measure.measureNumber
                                            ];

                                        const isMeasureInvalid =
                                            mv && (!mv.valid1 || !mv.valid2);

                                        return (
                                            <g
                                                key={`measure-${measure.measureNumber}`}
                                            >
                                                {isMeasureInvalid && (
                                                    <rect
                                                        x={measure.startX}
                                                        y={trebleTopY - 40}
                                                        width={
                                                            measure.endX -
                                                            measure.startX
                                                        }
                                                        height={
                                                            rhythmTopY -
                                                            trebleTopY +
                                                            85
                                                        }
                                                        fill={
                                                            DARK_THEME.bgInvalidMeasure
                                                        }
                                                        stroke="rgba(239, 68, 68, 0.4)"
                                                        strokeWidth="1.5"
                                                        rx={6}
                                                    />
                                                )}

                                                <text
                                                    x={measureCenterX}
                                                    y={
                                                        tabTopY +
                                                        5 * lineSpacing +
                                                        32
                                                    }
                                                    textAnchor="middle"
                                                    className="text-[10px] font-mono font-bold"
                                                    fill={
                                                        isMeasureInvalid
                                                            ? "#f87171"
                                                            : DARK_THEME.textTabString
                                                    }
                                                >
                                                    M{measure.measureNumber}{" "}
                                                    {isMeasureInvalid
                                                        ? "⚠️"
                                                        : ""}
                                                </text>

                                                {/* Cleaned up debugging text: dynamically hides absent voices */}
                                                {isMeasureInvalid &&
                                                    mv &&
                                                    (() => {
                                                        const pieces = [];

                                                        // Only include Voice 1 string if it's present and invalid
                                                        if (
                                                            mv.present1 &&
                                                            !mv.valid1
                                                        ) {
                                                            pieces.push(
                                                                `v1:${Number(mv.sum1).toFixed(2)}/${beatsPerMeasure}`
                                                            );
                                                        }

                                                        // Only include Voice 2 string if it's present and invalid
                                                        if (
                                                            mv.present2 &&
                                                            !mv.valid2
                                                        ) {
                                                            pieces.push(
                                                                `v2:${Number(mv.sum2).toFixed(2)}/${beatsPerMeasure}`
                                                            );
                                                        }

                                                        return (
                                                            <text
                                                                x={
                                                                    measureCenterX
                                                                }
                                                                y={
                                                                    tabTopY +
                                                                    5 *
                                                                    lineSpacing +
                                                                    48
                                                                }
                                                                textAnchor="middle"
                                                                className="text-[10px] font-mono font-semibold"
                                                                fill="#f87171"
                                                            >
                                                                {pieces.join(
                                                                    " "
                                                                )}
                                                            </text>
                                                        );
                                                    })()}
                                            </g>
                                        );
                                    })}

                                    {rowEvents.map((ev, idx) => {
                                        const isActive = activeIndices.includes(
                                            ev.globalIndex
                                        );
                                        // Ensures the background highlight box is only drawn once per time column
                                        const isPrimaryHighlightNode =
                                            isActive &&
                                            activeIndices[0] === ev.globalIndex;
                                        const currentNoteFill = isActive
                                            ? DARK_THEME.fillNoteHover
                                            : DARK_THEME.fillNote;

                                        const yLane =
                                            ev.voice === 2
                                                ? rhythm2TopY
                                                : rhythm1TopY;
                                        const restTabOffset =
                                            ev.voice === 2 ? 16 : -16;

                                        return (
                                            <g key={`node-${idx}`}>
                                                {isPrimaryHighlightNode && (
                                                    <rect
                                                        x={
                                                            ev.cx -
                                                            SLOT_WIDTH / 2 +
                                                            2
                                                        }
                                                        y={trebleTopY - 50}
                                                        width={SLOT_WIDTH - 4}
                                                        height={
                                                            rhythmTopY -
                                                            trebleTopY +
                                                            95
                                                        }
                                                        fill={
                                                            DARK_THEME.fillHoverHighlight
                                                        }
                                                        rx={4}
                                                    />
                                                )}

                                                <rect
                                                    x={ev.cx - SLOT_WIDTH / 2}
                                                    y={trebleTopY - 15}
                                                    width={SLOT_WIDTH}
                                                    height={
                                                        rhythmTopY -
                                                        trebleTopY +
                                                        65
                                                    }
                                                    fill="transparent"
                                                    pointerEvents="all"
                                                    onMouseEnter={() => {
                                                        if (!isPlaying)
                                                            setHoveredNoteIndex(
                                                                ev.globalIndex
                                                            );
                                                    }}
                                                    onMouseLeave={() => {
                                                        if (!isPlaying)
                                                            setHoveredNoteIndex(
                                                                null
                                                            );
                                                    }}
                                                />

                                                {ev.isRest ? (
                                                    <g>
                                                        {ev.rhythm === "r" && (
                                                            <path
                                                                d={`M ${ev.cx - 4} ${trebleTopY + 28} L ${ev.cx + 4} ${trebleTopY + 34} L ${ev.cx - 4} ${trebleTopY + 40} Q ${ev.cx + 6} ${trebleTopY + 44} ${ev.cx} ${trebleTopY + 50}`}
                                                                fill="none"
                                                                stroke={
                                                                    DARK_THEME.fillRest
                                                                }
                                                                strokeWidth="2"
                                                                strokeLinecap="round"
                                                            />
                                                        )}
                                                        {ev.rhythm === "r+" && (
                                                            <path
                                                                d={`M ${ev.cx - 3} ${trebleTopY + 32} A 3.5 3.5 0 1 1 ${ev.cx + 2} ${trebleTopY + 34} Q ${ev.cx - 2} ${trebleTopY + 38} ${ev.cx + 4} ${trebleTopY + 30} L ${ev.cx - 3} ${trebleTopY + 50}`}
                                                                fill="none"
                                                                stroke={
                                                                    DARK_THEME.fillRest
                                                                }
                                                                strokeWidth="2"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            />
                                                        )}
                                                        {ev.rhythm === "r=" && (
                                                            <g>
                                                                <path
                                                                    d={`M ${ev.cx - 2} ${trebleTopY + 27} A 3 3 0 1 1 ${ev.cx + 3} ${trebleTopY + 29} Q ${ev.cx - 1} ${trebleTopY + 33} ${ev.cx + 5} ${trebleTopY + 25}`}
                                                                    fill="none"
                                                                    stroke={
                                                                        DARK_THEME.fillRest
                                                                    }
                                                                    strokeWidth="2"
                                                                />
                                                                <path
                                                                    d={`M ${ev.cx - 4} ${trebleTopY + 36} A 3 3 0 1 1 ${ev.cx + 1} ${trebleTopY + 38} Q ${ev.cx - 3} ${trebleTopY + 42} ${ev.cx + 3} ${trebleTopY + 34} L ${ev.cx - 4} ${trebleTopY + 52}`}
                                                                    fill="none"
                                                                    stroke={
                                                                        DARK_THEME.fillRest
                                                                    }
                                                                    strokeWidth="2"
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                />
                                                            </g>
                                                        )}

                                                        <rect
                                                            x={ev.cx - 8}
                                                            y={
                                                                tabTopY +
                                                                2 *
                                                                lineSpacing -
                                                                4 +
                                                                restTabOffset
                                                            }
                                                            width={19}
                                                            height={20}
                                                            fill={
                                                                DARK_THEME.bgTabRect
                                                            }
                                                        />
                                                        <text
                                                            x={ev.cx}
                                                            y={
                                                                tabTopY +
                                                                3 *
                                                                lineSpacing -
                                                                6 +
                                                                restTabOffset
                                                            }
                                                            textAnchor="middle"
                                                            className="text-lg font-mono font-bold"
                                                            fill={
                                                                DARK_THEME.fillRest
                                                            }
                                                        >
                                                            𝄾
                                                        </text>
                                                    </g>
                                                ) : (
                                                    <g>
                                                        {ev.processedPitches.map(
                                                            (pitch, pIdx) => {
                                                                const clefTopY =
                                                                    pitch.clef ===
                                                                        "treble"
                                                                        ? trebleTopY
                                                                        : bassTopY;
                                                                const bottomStaffEdge =
                                                                    clefTopY +
                                                                    4 *
                                                                    lineSpacing;
                                                                const lowerLedgers =
                                                                    pitch.staffY >
                                                                        bottomStaffEdge
                                                                        ? Math.floor(
                                                                            (pitch.staffY -
                                                                                bottomStaffEdge) /
                                                                            lineSpacing
                                                                        )
                                                                        : 0;
                                                                const upperLedgers =
                                                                    pitch.staffY <
                                                                        clefTopY
                                                                        ? Math.floor(
                                                                            (clefTopY -
                                                                                pitch.staffY) /
                                                                            lineSpacing
                                                                        )
                                                                        : 0;

                                                                const voiceColor =
                                                                    ev.voice ===
                                                                        2
                                                                        ? DARK_THEME.voice2Color
                                                                        : DARK_THEME.voice1Color;
                                                                const activeNoteColor =
                                                                    isActive
                                                                        ? voiceColor
                                                                        : DARK_THEME.fillNote;
                                                                const activeStrokeColor =
                                                                    isActive
                                                                        ? voiceColor
                                                                        : DARK_THEME.fillNote;
                                                                const glowFilter =
                                                                    isActive
                                                                        ? "url(#note-glow)"
                                                                        : "none";

                                                                return (
                                                                    <g
                                                                        key={`p-${pIdx}`}
                                                                    >
                                                                        {pitch.isSharp && (
                                                                            <text
                                                                                x={
                                                                                    ev.cx +
                                                                                    10
                                                                                }
                                                                                y={
                                                                                    pitch.staffY +
                                                                                    5
                                                                                }
                                                                                className="text-base font-normal font-serif"
                                                                                fill={
                                                                                    activeStrokeColor
                                                                                }
                                                                                filter={
                                                                                    glowFilter
                                                                                }
                                                                            >
                                                                                ♯
                                                                            </text>
                                                                        )}

                                                                        {Array.from(
                                                                            {
                                                                                length: Math.max(
                                                                                    0,
                                                                                    upperLedgers
                                                                                )
                                                                            }
                                                                        ).map(
                                                                            (
                                                                                _,
                                                                                lIdx
                                                                            ) => (
                                                                                <line
                                                                                    key={`up-ledg-${lIdx}`}
                                                                                    x1={
                                                                                        ev.cx -
                                                                                        10
                                                                                    }
                                                                                    y1={
                                                                                        clefTopY -
                                                                                        (lIdx +
                                                                                            1) *
                                                                                        lineSpacing
                                                                                    }
                                                                                    x2={
                                                                                        ev.cx +
                                                                                        10
                                                                                    }
                                                                                    y2={
                                                                                        clefTopY -
                                                                                        (lIdx +
                                                                                            1) *
                                                                                        lineSpacing
                                                                                    }
                                                                                    stroke={
                                                                                        DARK_THEME.lineStaff
                                                                                    }
                                                                                    strokeWidth="1.2"
                                                                                />
                                                                            )
                                                                        )}
                                                                        {Array.from(
                                                                            {
                                                                                length: Math.max(
                                                                                    0,
                                                                                    lowerLedgers
                                                                                )
                                                                            }
                                                                        ).map(
                                                                            (
                                                                                _,
                                                                                lIdx
                                                                            ) => (
                                                                                <line
                                                                                    key={`low-ledg-${lIdx}`}
                                                                                    x1={
                                                                                        ev.cx -
                                                                                        10
                                                                                    }
                                                                                    y1={
                                                                                        bottomStaffEdge +
                                                                                        (lIdx +
                                                                                            1) *
                                                                                        lineSpacing
                                                                                    }
                                                                                    x2={
                                                                                        ev.cx +
                                                                                        10
                                                                                    }
                                                                                    y2={
                                                                                        bottomStaffEdge +
                                                                                        (lIdx +
                                                                                            1) *
                                                                                        lineSpacing
                                                                                    }
                                                                                    stroke={
                                                                                        DARK_THEME.lineStaff
                                                                                    }
                                                                                    strokeWidth="1.2"
                                                                                />
                                                                            )
                                                                        )}

                                                                        {pitch.fret ===
                                                                            null ? (
                                                                            <g>
                                                                                <line
                                                                                    x1={
                                                                                        ev.cx -
                                                                                        6
                                                                                    }
                                                                                    y1={
                                                                                        pitch.staffY -
                                                                                        6
                                                                                    }
                                                                                    x2={
                                                                                        ev.cx +
                                                                                        6
                                                                                    }
                                                                                    y2={
                                                                                        pitch.staffY +
                                                                                        6
                                                                                    }
                                                                                    stroke={
                                                                                        activeStrokeColor
                                                                                    }
                                                                                    strokeWidth="1.8"
                                                                                    strokeLinecap="round"
                                                                                />
                                                                                <line
                                                                                    x1={
                                                                                        ev.cx -
                                                                                        6
                                                                                    }
                                                                                    y1={
                                                                                        pitch.staffY +
                                                                                        6
                                                                                    }
                                                                                    x2={
                                                                                        ev.cx +
                                                                                        6
                                                                                    }
                                                                                    y2={
                                                                                        pitch.staffY -
                                                                                        6
                                                                                    }
                                                                                    stroke={
                                                                                        activeStrokeColor
                                                                                    }
                                                                                    strokeWidth="1.8"
                                                                                    strokeLinecap="round"
                                                                                />
                                                                            </g>
                                                                        ) : ev.beatValue >=
                                                                            2.0 ? (
                                                                            <ellipse
                                                                                cx={
                                                                                    ev.cx
                                                                                }
                                                                                cy={
                                                                                    pitch.staffY
                                                                                }
                                                                                rx={
                                                                                    5.5
                                                                                }
                                                                                ry={
                                                                                    4
                                                                                }
                                                                                transform={`rotate(-22 ${ev.cx} ${pitch.staffY})`}
                                                                                fill="none"
                                                                                stroke={
                                                                                    activeStrokeColor
                                                                                }
                                                                                strokeWidth="1.8"
                                                                                filter={
                                                                                    glowFilter
                                                                                }
                                                                            />
                                                                        ) : (
                                                                            <ellipse
                                                                                cx={
                                                                                    ev.cx
                                                                                }
                                                                                cy={
                                                                                    pitch.staffY
                                                                                }
                                                                                rx={
                                                                                    5.5
                                                                                }
                                                                                ry={
                                                                                    4
                                                                                }
                                                                                transform={`rotate(-22 ${ev.cx} ${pitch.staffY})`}
                                                                                fill={
                                                                                    activeNoteColor
                                                                                }
                                                                                filter={
                                                                                    glowFilter
                                                                                }
                                                                            />
                                                                        )}

                                                                        {ev.isTiedToNext &&
                                                                            pitch.fret !==
                                                                            null &&
                                                                            (() => {
                                                                                const nextEv =
                                                                                    rowEvents
                                                                                        .slice(
                                                                                            idx +
                                                                                            1
                                                                                        )
                                                                                        .find(
                                                                                            e =>
                                                                                                e.voice ===
                                                                                                ev.voice &&
                                                                                                !e.isRest
                                                                                        );
                                                                                if (
                                                                                    !nextEv
                                                                                )
                                                                                    return null;
                                                                                const targetPitch =
                                                                                    nextEv.processedPitches.find(
                                                                                        np =>
                                                                                            np.string ===
                                                                                            pitch.string
                                                                                    ) ||
                                                                                    nextEv
                                                                                        .processedPitches[0];
                                                                                if (
                                                                                    targetPitch &&
                                                                                    targetPitch.fret !==
                                                                                    null
                                                                                ) {
                                                                                    return (
                                                                                        <path
                                                                                            d={`M ${ev.cx + 4} ${pitch.staffY + 5} Q ${(ev.cx + nextEv.cx) / 2} ${Math.max(pitch.staffY, targetPitch.staffY) + 16} ${nextEv.cx - 4} ${targetPitch.staffY + 5}`}
                                                                                            fill="none"
                                                                                            stroke={
                                                                                                DARK_THEME.lineTie
                                                                                            }
                                                                                            strokeWidth="1.8"
                                                                                            strokeLinecap="round"
                                                                                        />
                                                                                    );
                                                                                }
                                                                                return null;
                                                                            })()}

                                                                        {ev.isTiedToNext &&
                                                                            pitch.fret !==
                                                                            null &&
                                                                            (() => {
                                                                                const nextEv =
                                                                                    rowEvents
                                                                                        .slice(
                                                                                            idx +
                                                                                            1
                                                                                        )
                                                                                        .find(
                                                                                            e =>
                                                                                                e.voice ===
                                                                                                ev.voice &&
                                                                                                !e.isRest
                                                                                        );
                                                                                if (
                                                                                    !nextEv
                                                                                )
                                                                                    return null;

                                                                                const targetPitch =
                                                                                    nextEv.processedPitches.find(
                                                                                        np =>
                                                                                            np.string ===
                                                                                            pitch.string
                                                                                    );
                                                                                if (
                                                                                    !targetPitch ||
                                                                                    targetPitch.fret ===
                                                                                    null
                                                                                )
                                                                                    return null;

                                                                                // Replace with this to dynamically compute the active state, stroke color, and glow filter:
                                                                                const isTieActive =
                                                                                    activeIndices.includes(
                                                                                        ev.globalIndex
                                                                                    ) ||
                                                                                    activeIndices.includes(
                                                                                        nextEv.globalIndex
                                                                                    );
                                                                                const tieStrokeColor =
                                                                                    isTieActive
                                                                                        ? ev.voice ===
                                                                                            2
                                                                                            ? DARK_THEME.voice2Color
                                                                                            : DARK_THEME.voice1Color
                                                                                        : DARK_THEME.lineTie;
                                                                                const tieGlow =
                                                                                    isTieActive
                                                                                        ? "url(#note-glow)"
                                                                                        : "none";

                                                                                if (
                                                                                    targetPitch.midi ===
                                                                                    pitch.midi
                                                                                ) {
                                                                                    return (
                                                                                        <path
                                                                                            d={`M ${ev.cx + 4} ${pitch.tabY} Q ${(ev.cx + nextEv.cx) / 2} ${pitch.tabY + 12} ${nextEv.cx - 4} ${targetPitch.tabY}`}
                                                                                            fill="none"
                                                                                            stroke={
                                                                                                tieStrokeColor
                                                                                            }
                                                                                            strokeWidth={
                                                                                                isTieActive
                                                                                                    ? "2.5"
                                                                                                    : "1.8"
                                                                                            }
                                                                                            strokeLinecap="round"
                                                                                            filter={
                                                                                                tieGlow
                                                                                            }
                                                                                        />
                                                                                    );
                                                                                } else {
                                                                                    return (
                                                                                        <line
                                                                                            x1={
                                                                                                ev.cx +
                                                                                                12
                                                                                            }
                                                                                            y1={
                                                                                                pitch.tabY
                                                                                            }
                                                                                            x2={
                                                                                                nextEv.cx -
                                                                                                12
                                                                                            }
                                                                                            y2={
                                                                                                targetPitch.tabY
                                                                                            }
                                                                                            stroke={
                                                                                                tieStrokeColor
                                                                                            }
                                                                                            strokeWidth={
                                                                                                isTieActive
                                                                                                    ? "3"
                                                                                                    : "2"
                                                                                            }
                                                                                            strokeLinecap="round"
                                                                                            filter={
                                                                                                tieGlow
                                                                                            }
                                                                                        />
                                                                                    );
                                                                                }
                                                                            })()}

                                                                        {/* Bordered Rectangle Box for Fret Numbers */}
                                                                        <rect
                                                                            x={
                                                                                ev.cx -
                                                                                13
                                                                            }
                                                                            y={
                                                                                pitch.tabY -
                                                                                11
                                                                            }
                                                                            width={
                                                                                20
                                                                            }
                                                                            height={
                                                                                18
                                                                            }
                                                                            fill="#0f172a"
                                                                            stroke={
                                                                                activeStrokeColor
                                                                            }
                                                                            strokeWidth={
                                                                                isActive
                                                                                    ? "2"
                                                                                    : "1.5"
                                                                            }
                                                                            filter={
                                                                                glowFilter
                                                                            }
                                                                            rx={
                                                                                3
                                                                            }
                                                                        />

                                                                        {/* Fret Number Text */}
                                                                        <text
                                                                            x={
                                                                                ev.cx -
                                                                                3
                                                                            }
                                                                            y={
                                                                                pitch.tabY +
                                                                                3.2
                                                                            }
                                                                            textAnchor="middle"
                                                                            className="text-xs font-sans font-black tracking-wide"
                                                                            fill={
                                                                                isActive
                                                                                    ? DARK_THEME.textTabNumberHover
                                                                                    : DARK_THEME.textTabNumber
                                                                            }
                                                                        >
                                                                            {pitch.fret ===
                                                                                null
                                                                                ? "X"
                                                                                : pitch.fret}
                                                                        </text>
                                                                    </g>
                                                                );
                                                            }
                                                        )}

                                                        {/* Treble Voice Stems */}
                                                        {ev.trebleStem &&
                                                            ev.beatValue <
                                                            4.0 &&
                                                            (() => {
                                                                const voiceColor =
                                                                    ev.voice ===
                                                                        2
                                                                        ? DARK_THEME.voice2Color
                                                                        : DARK_THEME.voice1Color;
                                                                const activeStrokeColor =
                                                                    isActive
                                                                        ? voiceColor
                                                                        : DARK_THEME.fillNote;
                                                                const glowFilter =
                                                                    isActive
                                                                        ? "url(#note-glow)"
                                                                        : "none";

                                                                const {
                                                                    lowestY,
                                                                    highestY,
                                                                    stemDown
                                                                } =
                                                                    ev.trebleStem;
                                                                const xPos =
                                                                    stemDown
                                                                        ? ev.cx -
                                                                        5.5
                                                                        : ev.cx +
                                                                        5.5;
                                                                const extY =
                                                                    stemDown
                                                                        ? lowestY +
                                                                        28
                                                                        : highestY -
                                                                        28;
                                                                const numFlags =
                                                                    ev.beatValue <=
                                                                        0.25
                                                                        ? 2
                                                                        : ev.beatValue <=
                                                                            0.75
                                                                            ? 1
                                                                            : 0;

                                                                return (
                                                                    <g
                                                                        filter={
                                                                            glowFilter
                                                                        }
                                                                    >
                                                                        <line
                                                                            x1={
                                                                                xPos
                                                                            }
                                                                            y1={
                                                                                highestY
                                                                            }
                                                                            x2={
                                                                                xPos
                                                                            }
                                                                            y2={
                                                                                extY
                                                                            }
                                                                            stroke={
                                                                                activeStrokeColor
                                                                            }
                                                                            strokeWidth="1.6"
                                                                        />
                                                                        {numFlags >
                                                                            0 && (
                                                                                <path
                                                                                    d={getFlagPath(
                                                                                        xPos,
                                                                                        extY,
                                                                                        stemDown,
                                                                                        numFlags
                                                                                    )}
                                                                                    fill={
                                                                                        activeStrokeColor
                                                                                    }
                                                                                />
                                                                            )}
                                                                    </g>
                                                                );
                                                            })()}

                                                        {/* Bass Voice Stems */}
                                                        {ev.bassStem &&
                                                            ev.beatValue <
                                                            4.0 &&
                                                            (() => {
                                                                const voiceColor =
                                                                    ev.voice ===
                                                                        2
                                                                        ? DARK_THEME.voice2Color
                                                                        : DARK_THEME.voice1Color;
                                                                const activeStrokeColor =
                                                                    isActive
                                                                        ? voiceColor
                                                                        : DARK_THEME.fillNote;
                                                                const glowFilter =
                                                                    isActive
                                                                        ? "url(#note-glow)"
                                                                        : "none";

                                                                const {
                                                                    lowestY,
                                                                    highestY,
                                                                    stemDown
                                                                } = ev.bassStem;
                                                                const xPos =
                                                                    stemDown
                                                                        ? ev.cx -
                                                                        5.5
                                                                        : ev.cx +
                                                                        5.5;
                                                                const extY =
                                                                    stemDown
                                                                        ? lowestY +
                                                                        28
                                                                        : highestY -
                                                                        28;
                                                                const numFlags =
                                                                    ev.beatValue <=
                                                                        0.25
                                                                        ? 2
                                                                        : ev.beatValue <=
                                                                            0.75
                                                                            ? 1
                                                                            : 0;

                                                                return (
                                                                    <g
                                                                        filter={
                                                                            glowFilter
                                                                        }
                                                                    >
                                                                        <line
                                                                            x1={
                                                                                xPos
                                                                            }
                                                                            y1={
                                                                                highestY
                                                                            }
                                                                            x2={
                                                                                xPos
                                                                            }
                                                                            y2={
                                                                                extY
                                                                            }
                                                                            stroke={
                                                                                activeStrokeColor
                                                                            }
                                                                            strokeWidth="1.6"
                                                                        />
                                                                        {numFlags >
                                                                            0 && (
                                                                                <path
                                                                                    d={getFlagPath(
                                                                                        xPos,
                                                                                        extY,
                                                                                        stemDown,
                                                                                        numFlags
                                                                                    )}
                                                                                    fill={
                                                                                        activeStrokeColor
                                                                                    }
                                                                                />
                                                                            )}
                                                                    </g>
                                                                );
                                                            })()}

                                                        {/* Rhythm Extension Dot Flags */}
                                                        {[
                                                            6.0, 3.0, 1.5, 0.75
                                                        ].includes(
                                                            ev.beatValue
                                                        ) && (
                                                                <circle
                                                                    cx={ev.cx + 12}
                                                                    cy={
                                                                        (ev
                                                                            .trebleStem
                                                                            ?.highestY ||
                                                                            ev
                                                                                .bassStem
                                                                                ?.highestY ||
                                                                            trebleTopY) -
                                                                        3
                                                                    }
                                                                    r={2}
                                                                    fill={
                                                                        currentNoteFill
                                                                    }
                                                                />
                                                            )}
                                                    </g>
                                                )}

                                                {/* Polyphonic Rhythm Lane */}
                                                <g>
                                                    <rect
                                                        x={
                                                            ev.cx -
                                                            SLOT_WIDTH / 2 +
                                                            4
                                                        }
                                                        y={yLane - 18}
                                                        width={SLOT_WIDTH - 8}
                                                        height={24}
                                                        fill={
                                                            ev.voice === 2
                                                                ? "rgba(236, 72, 153, 0.08)"
                                                                : "rgba(96, 165, 250, 0.08)"
                                                        }
                                                        rx="2"
                                                    />
                                                    {ev.isTiedToNext &&
                                                        (() => {
                                                            const nextEv =
                                                                rowEvents
                                                                    .slice(
                                                                        idx + 1
                                                                    )
                                                                    .find(
                                                                        e =>
                                                                            e.voice ===
                                                                            ev.voice
                                                                    );
                                                            if (nextEv)
                                                                return (
                                                                    <line
                                                                        x1={
                                                                            ev.cx +
                                                                            20
                                                                        }
                                                                        y1={
                                                                            yLane -
                                                                            4
                                                                        }
                                                                        x2={
                                                                            nextEv.cx -
                                                                            20
                                                                        }
                                                                        y2={
                                                                            yLane -
                                                                            4
                                                                        }
                                                                        stroke={
                                                                            DARK_THEME.lineStaff
                                                                        }
                                                                        strokeWidth="2"
                                                                        strokeLinecap="round"
                                                                    />
                                                                );
                                                            return null;
                                                        })()}
                                                    <text
                                                        x={ev.cx}
                                                        y={yLane}
                                                        textAnchor="middle"
                                                        className="font-mono font-black text-sm"
                                                        fill={
                                                            ev.isRest
                                                                ? DARK_THEME.fillRest
                                                                : ev.voice === 2
                                                                    ? DARK_THEME.voice2Rhythm
                                                                    : DARK_THEME.voice1Rhythm
                                                        }
                                                    >
                                                        {ev.rhythm}
                                                    </text>
                                                </g>
                                            </g>
                                        );
                                    })}
                                </svg>
                            </div>
                        );
                    }
                )}
            </div>
        </div>
    );
}
