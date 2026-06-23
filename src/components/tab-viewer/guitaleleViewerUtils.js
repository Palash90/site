export const DARK_THEME = {
    bgPage: "bg-slate-950",
    bgScore: "bg-slate-900",
    borderScore: "border-transparent",

    lineStaff: "#4a4a83",
    lineTab: "#57576e",
    lineBar: "#103466",
    lineTie: "#8aa8d1",

    textClef: "#64748b",
    textTimeSig: "#fbbf24",
    textTabLabel: "#7a60b6",
    textTabString: "#911c6e",
    bgTabRect: "#0f172a",
    textTabNumber: "#e2e8f0",

    lineStem: "#38bdf8",
    fillNote: "#38bdf8",
    fillRest: "#f43f5e",
    textRhythm: "#94a3b8",
    inactiveVoiceColor: "#8395af",

    voice1Color: "#21cea3",
    voice1Rhythm: "#818cf8",
    voice1RhytmBg: "rgba(149, 165, 128, 0.08)",

    voice2Color: "#fb923c",
    voice2Rhythm: "#f472b6",
    voice2RhythmBg: "rgba(244, 114, 182, 0.08)",

    fillHoverHighlight: "rgba(56, 189, 248, 0.08)",
    fillNoteHover: "#7dd3fc",
    strokeNoteHover: "#ffffff",
    textTabNumberHover: "#ffffff",
    textRhythmHover: "#f8fafc",
    sustainedNoteHighlight: "#6e899933",

    bgInvalidMeasure: "rgba(225, 29, 72, 0.15)",

    metronomeControlMedium: "#a78bfa", // Medium purple text and track slider control
    metronomeDownBeat: "#ff2a5f",      // Deep/Dark Intense ruby pink-red for Downbeats (Beat 1)
    metronomeUpBeat: "#2ae8b2",

};

export const CHROMATIC_MAP = {
    0: [0, false],
    1: [0, true],
    2: [1, false],
    3: [1, true],
    4: [2, false],
    5: [3, false],
    6: [3, true],
    7: [4, false],
    8: [4, true],
    9: [5, false],
    10: [5, true],
    11: [6, false]
};

export const DURATION_OPTIONS = [
    { value: 0.25, label: "Sixteenth note" },
    { value: 0.5, label: "Eighth note" },
    { value: 0.75, label: "Dotted eighth note" },
    { value: 1.0, label: "Quarter note" },
    { value: 1.5, label: "Dotted quarter note" },
    { value: 2.0, label: "Half note" },
    { value: 3.0, label: "Dotted half note" },
    { value: 4.0, label: "Whole note" },
    { value: 6.0, label: "Dotted whole note" }
];

export const getDurationLabel = beatValue => {
    const option = DURATION_OPTIONS.find(
        duration => duration.value === beatValue
    );
    return option ? option.label : `${beatValue} beats`;
};

export const parsePitchProperties = (midiNumber, clef, clefTopY, lineSpacing) => {
    const visualAnchorMidi = clef === "treble" ? 64 : 43;
    const visualAnchorY = clefTopY + 4 * lineSpacing;

    const getDiatonicAbsoluteStep = midi => {
        const pitchClass = midi % 12;
        const octave = Math.floor(midi / 12);
        const [step] = CHROMATIC_MAP[pitchClass];
        return octave * 7 + step;
    };

    const currentStep = getDiatonicAbsoluteStep(midiNumber);
    const anchorStep = getDiatonicAbsoluteStep(visualAnchorMidi);
    const stepDiff = currentStep - anchorStep;

    return {
        y: visualAnchorY - stepDiff * (lineSpacing / 2),
        isSharp: CHROMATIC_MAP[midiNumber % 12][1]
    };
};

export const getFlagPath = (sx, sy, isDown = false, flags = 1) => {
    const drawSlashSegment = yOffset => {
        const sY = sy + yOffset;
        if (isDown) {
            return `M ${sx} ${sY} L ${sx + 7} ${sY - 8} L ${sx + 7} ${sY - 5} L ${sx} ${sY + 3} Z`;
        }
        return `M ${sx} ${sY} L ${sx + 7} ${sY + 8} L ${sx + 7} ${sY + 5} L ${sx} ${sY - 3} Z`;
    };

    let path = "";
    for (let i = 0; i < flags; i++) {
        path += drawSlashSegment(isDown ? -(i * 9) : i * 9) + " ";
    }
    return path.trim();
};

export const calculateSchedulerBoundaries = bpm => {
    const beatDurationMs = (60 / bpm) * 1000;
    const sixteenthNoteMs = beatDurationMs / 4;

    // Lookahead Interval: roughly 40% of a sixteenth note, bounded between 15ms and 45ms.
    const lookaheadInterval = Math.max(
        15,
        Math.min(45, Math.round(sixteenthNoteMs * 0.4))
    );

    // Schedule Ahead Time: The safety padding window (in seconds), minimum 1.0s to handle high BPM rendering load.
    const scheduleAheadTime = Math.max(1.0, (lookaheadInterval * 10) / 1000);

    return { lookaheadInterval, scheduleAheadTime };
};

export const outerContainerStyle = {
    position: "relative", // Establishes boundary for absolute positioning
    width: "100%", // Adapts to wherever you drop it in the page
    overflow: "hidden", // Prevents content from breaking outside the box
    border: "none",
    boxSizing: "border-box",
    padding: "0", // Reset any default padding
    margin: "0" // Reset any default margin
};

export const fixedTopRightStyle = {
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

export const scrollableContentStyle = {
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
