import { useMemo } from "react";
import { TUNING, NOTE_NAMES, RHYTHM_BEAT_VALUES } from "./audio";
import { parsePitchProperties } from "./guitaleleViewerUtils";

export function useBuildScoreLayout(scoreData, slotWidth, measuresPerRow) {
    return useMemo(() => {
        // 1. Updated guard clause to check for the 'measures' array
        if (!scoreData || !scoreData.measures) return null;

        const paddingX = 130;
        const lineSpacing = 18;
        const trebleTopY = 100;
        const bassTopY = trebleTopY + 120;
        const tabTopY = bassTopY + 120;
        const rhythmTopY = tabTopY + 180;

        const timeSigTop = scoreData.timeSignature?.split("/")[0] || "4";
        const timeSigBottom = scoreData.timeSignature?.split("/")[1] || "4";
        const numerator = parseInt(timeSigTop, 10);
        const denominator = parseInt(timeSigBottom, 10);
        const beatsPerMeasure = numerator * (4 / denominator);

        const SLOT_WIDTH = slotWidth;
        const MEASURE_PADDING = 25;

        let processedEvents = [];
        let absoluteMeasureStartBeat = 0;
        let globalEventIndex = 0; // Tracks the ID for playback/hover highlighting across measures


        // Loop through isolated measure containers
        scoreData.measures.forEach(measure => {
            const mNum = measure.measureNumber;
            let localCursors = { 1: 0, 2: 0 };

            // We'll use a temporary map for this measure to merge notes sharing the same startBeat and voice
            const beatMergeMap = {};

            // --- METRONOME LINE GENERATION ---
            for (let click = 0; click < numerator; click++) {
                const clickBeatSpacing = 4 / denominator; 
                const clickStartBeat = absoluteMeasureStartBeat + (click * clickBeatSpacing);
                const clickMergeKey = `0_${clickStartBeat}`;

                beatMergeMap[clickMergeKey] = {
                    globalIndex: null, // Assigned sequentially during final flattening
                    measureNumber: mNum,
                    voice: 0,
                    startBeat: clickStartBeat,
                    beatValue: clickBeatSpacing,
                    isRest: false,
                    isMetronomeTick: true,
                    isDownbeat: click === 0, // Useful for adding visual accent to beat 1
                    rhythm: ":", // Default rhythm label for metronome ticks
                    pitches: [],
                    descriptions: ["Metronome"]
                };
            }

            measure.notes.forEach(event => {
                let detectedRhythm = event.rhythm;
                let pitches = event.pitches || [];

                if (!event.pitches &&
                    event.fret !== undefined &&
                    event.string !== undefined) {
                    pitches = [{ fret: event.fret, string: event.string }];
                }

                const uniqueStringsMap = {};
                pitches.forEach(p => {
                    if (uniqueStringsMap[p.string] === undefined ||
                        p.fret > uniqueStringsMap[p.string].fret) {
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

                const beatValue = event.duration !== undefined
                    ? event.duration
                    : RHYTHM_BEAT_VALUES[detectedRhythm || ":"] || 1.0;
                const voice = event.voice || 1;
                const startBeat = absoluteMeasureStartBeat + localCursors[voice];

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
                        isRest: isRestEvent ||
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
                if (mergedEvent.descriptions &&
                    mergedEvent.descriptions.length > 0) {
                    mergedEvent.description =
                        mergedEvent.descriptions.join(" | ");
                } else if (!mergedEvent.description) {
                    mergedEvent.description = "";
                }

                // De-duplicate any pitch collisions on identical strings if multiple notes collided
                const finalPitchesMap = {};
                mergedEvent.pitches.forEach(p => {
                    if (finalPitchesMap[p.string] === undefined ||
                        p.fret > finalPitchesMap[p.string].fret) {
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
        const totalMeasures = scoreData.measures.length > 0
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
                const uniqueSlotsCount = measureSortedSlots[measureNum]?.length || 1;

                const mWidth = uniqueSlotsCount * SLOT_WIDTH + MEASURE_PADDING * 2;
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
                    ev => ev.measureNumber > i &&
                        ev.measureNumber <= i + rowMeasuresCount
                )
                .map(ev => {
                    const mGroup = measureGroups.find(
                        g => g.measureNumber === ev.measureNumber
                    );
                    const slotIndex = mGroup.slotsArray.indexOf(ev.startBeat);
                    const cx = mGroup.startX +
                        MEASURE_PADDING +
                        slotIndex * SLOT_WIDTH +
                        SLOT_WIDTH / 2;

                    const processedPitches = ev.pitches.map(p => {
                        const tabY = tabTopY + (p.string - 1) * lineSpacing;
                        const midi = TUNING[p.string].baseMidi + p.fret;
                        const clef = midi >= 60 ? "treble" : "bass";
                        const clefTopY = clef === "treble" ? trebleTopY : bassTopY;
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

                    const isPolyphonicMeasure = measureValidityMap[ev.measureNumber]?.isPolyphonic;

                    const computeStaffStemData = (pitches, midLineMidi) => {
                        if (pitches.length === 0) return null;
                        const staffYs = pitches.map(p => p.staffY);
                        const lowestY = Math.max(...staffYs);
                        const highestY = Math.min(...staffYs);
                        const avgMidi = pitches.reduce((sum, p) => sum + p.midi, 0) /
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
            lineSpacing,
            SLOT_WIDTH,
            measureValidityMap,
            beatsPerMeasure
        };
    }, [scoreData, slotWidth, measuresPerRow]);
}