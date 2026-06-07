export const DARK_THEME = {
    // --- 1. Base Backgrounds ---
    bgPage: "bg-slate-950",
    bgScore: "bg-slate-900",
    borderScore: "border-slate-800",

    // --- 2. Structural Lines (Muted to let notes pop) ---
    lineStaff: "#4a4a83", // Zinc 800 - dark, clean background lines
    lineTab: "#57576e", // Slightly darker zinc so it doesn't fight the notes
    lineBar: "#103466", // Gray 600 - subtle but distinct division
    lineTie: "#8aa8d1", // Slate 500

    // --- 3. Static UI Text & Symbols ---
    textClef: "#64748b", // Slate 500 - visible but secondary
    textTimeSig: "#fbbf24", // Amber 400 - nice gold accent
    textTabLabel: "#4b5563", // Slate 600
    textTabString: "#374151", // Slate 600
    bgTabRect: "#0f172a", // Matches bgScore exactly for seamless masking
    textTabNumber: "#e2e8f0", // Slate 300 - clear baseline readability

    // --- 4. Core Musical Elements (Voice 1 Default) ---
    lineStem: "#38bdf8", // Sky 400
    fillNote: "#38bdf8", // Sky 400
    fillRest: "#f43f5e", // Rose 500 - distinctly different from playable notes
    textRhythm: "#94a3b8", // Slate 400

    // --- 5. Polyphonic Voices (High Contrast) ---
    voice1Color: "#21cea3", // Sky 400 (Cool)
    voice1Rhythm: "#818cf8", // Indigo 400 (Cool contrast)

    voice2Color: "#fb923c", // Orange 400 (Warm)
    voice2Rhythm: "#f472b6", // Pink 400 (Warm contrast)

    // --- 6. Hover & Interaction (The Glow) ---
    fillHoverHighlight: "rgba(56, 189, 248, 0.08)", // Very subtle sky-blue glass effect
    fillNoteHover: "#7dd3fc", // Sky 300
    strokeNoteHover: "#ffffff", // Pure white for maximum pop when hovered
    textTabNumberHover: "#ffffff",
    textRhythmHover: "#f8fafc", // Slate 50

    // --- 7. System States ---
    bgInvalidMeasure: "rgba(225, 29, 72, 0.15)" // Rose 600 transparent
};

export const RHYTHM_BEAT_VALUES = {
    o: 4.0,
    "o.": 6.0,
    ".": 2.0,
    "..": 3.0,
    ":": 1.0,
    ":.": 1.5,
    "+": 0.5,
    "+.": 0.75,
    "=": 0.25,
    r: 1.0,
    "r.": 1.5,
    "r+": 0.5,
    "r=": 0.25
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

export const NOTE_NAMES = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B"
];

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

    // Schedule Ahead Time: The safety padding window (in seconds).
    const scheduleAheadTime = (lookaheadInterval * 3.5) / 1000;

    return { lookaheadInterval, scheduleAheadTime };
};

export const outerContainerStyle = {
    position: "relative", // Establishes boundary for absolute positioning
    width: "100%", // Adapts to wherever you drop it in the page
    overflow: "hidden", // Prevents content from breaking outside the box
    border: "1px solid #ccc",
    boxSizing: "border-box"
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
