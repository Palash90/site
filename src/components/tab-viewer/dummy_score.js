export const two_voice_test = {
    id: "two_voice_test",
    title: "Two Voice Separation Demo",
    instrument: "Guitalele",
    timeSignature: "4/4",
    measures: [
        {
            measureNumber: 1,
            notes: [
                {
                    duration: 4.0,
                    voice: 1,
                    description:
                        "Voice 1: Sustained C major chord (C3, E3, G3, C4, E4, C5) held for a whole note duration.",
                    pitches: [
                        { fret: null, string: 6 },
                        { fret: 2, string: 5 },
                        { fret: 0, string: 4 },
                        { fret: 0, string: 3 },
                        { fret: 0, string: 2 },
                        { fret: 14, string: 1 }
                    ]
                },
                { fret: 0, string: 1, duration: 1.0, voice: 2 },
                { fret: null, string: 1, duration: 1.0, voice: 2 },
                { fret: 3, string: 2, duration: 0.5, voice: 2 },
                { fret: 1, string: 2, duration: 0.5, voice: 2 },
                { fret: 0, string: 3, duration: 1.0, voice: 2 }
            ]
        },
        {
            measureNumber: 2,
            notes: [
                { fret: 2, string: 6, duration: 2.0, voice: 1 },
                { fret: 0, string: 5, duration: 2.0, voice: 1 },
                { duration: 2.0, voice: 2 }, // Rest
                { fret: 5, string: 1, duration: 1.0, voice: 2 },
                { fret: 7, string: 1, duration: 1.0, voice: 2 }
            ]
        }
    ]
};

export const dummyScore = {
    id: "full_test_score",
    title: "Guitalele Tab viewer Full Test Score",
    instrument: "Guitalele",
    description:
        "Comprehensive 52-measure composition covering extreme upper/lower staff boundaries, dynamic rhythms, and true horizontal layout tracking.",
    timeSignature: "4/4",
    measures: [
        {
            measureNumber: 1,
            notes: [
                {
                    fret: 5,
                    string: 3,
                    duration: 4.0,
                    voice: 1,
                    description: "Description from input: C whole note"
                },
                { fret: 17, string: 1, duration: 1.0, voice: 2 },
                { fret: 2, string: 1, duration: 1.0, voice: 2 },
                { fret: 3, string: 2, duration: 1.0, voice: 2 },
                { fret: 0, string: 3, duration: 1.0, voice: 2 }
            ]
        },
        {
            measureNumber: 2,
            notes: [
                { fret: 2, string: 3, duration: 2.0, voice: 1 },
                { fret: 3, string: 2, duration: 2.0, voice: 1 },
                { fret: 5, string: 1, duration: 1.0, voice: 2 },
                { fret: 7, string: 1, duration: 1.0, voice: 2 },
                { fret: 5, string: 2, duration: 1.0, voice: 2 },
                { fret: 3, string: 2, duration: 1.0, voice: 2 }
            ]
        },
        {
            measureNumber: 3,
            notes: [
                { fret: 0, string: 1, duration: 1.0, voice: 1 },
                { fret: 2, string: 1, duration: 1.0, voice: 1 },
                { fret: 3, string: 1, duration: 1.0, voice: 1 },
                { fret: null, string: 2, duration: 1.0, voice: 1 },
                { fret: 0, string: 1, duration: 0.5, voice: 2 },
                { fret: 1, string: 1, duration: 0.5, voice: 2 },
                { fret: 2, string: 1, duration: 0.5, voice: 2 },
                { fret: 3, string: 1, duration: 0.5, voice: 2 },
                { fret: 0, string: 2, duration: 0.5, voice: 2 },
                { fret: 1, string: 2, duration: 0.5, voice: 2 },
                { fret: 2, string: 2, duration: 0.5, voice: 2 },
                { fret: 3, string: 2, duration: 0.5, voice: 2 }
            ]
        },
        {
            measureNumber: 4,
            notes: [
                { fret: 0, string: 6, duration: 1.0 },
                { fret: 2, string: 6, duration: 1.0 },
                { fret: 0, string: 5, duration: 1.0 },
                { fret: 2, string: 5, duration: 1.0 }
            ]
        },
        {
            measureNumber: 5,
            notes: [
                { fret: 0, string: 4, duration: 1.0 },
                { fret: 2, string: 4, duration: 1.0 },
                { fret: 0, string: 3, duration: 1.0 },
                { fret: 2, string: 3, duration: 1.0 }
            ]
        },
        {
            measureNumber: 6,
            notes: [
                { fret: 0, string: 2, duration: 0.5 },
                { fret: 1, string: 2, duration: 0.5 },
                { duration: 1.0 },
                { fret: 3, string: 2, duration: 1.0, tie: true },
                { fret: 3, string: 2, duration: 1.0 }
            ]
        },
        {
            measureNumber: 7,
            notes: [
                { fret: 0, string: 1, duration: 1.0 },
                { duration: 0.5 },
                { fret: 5, string: 1, duration: 0.5 },
                { duration: 0.25 },
                { fret: 7, string: 1, duration: 0.25 },
                { fret: 12, string: 1, duration: 1.5 }
            ]
        },
        {
            measureNumber: 8,
            notes: [
                { fret: 3, string: 3, duration: 1.0 },
                { fret: 2, string: 2, duration: 0.5 },
                { fret: 0, string: 1, duration: 0.5 },
                { duration: 1.0 },
                { fret: 2, string: 2, duration: 1.0 }
            ]
        },
        {
            measureNumber: 9,
            notes: [
                { fret: 3, string: 3, duration: 1.0 },
                { fret: 2, string: 2, duration: 0.5 },
                { fret: 0, string: 1, duration: 0.5 },
                { duration: 1.0 },
                { fret: 2, string: 2, duration: 1.0 }
            ]
        },
        {
            measureNumber: 10,
            notes: [
                { fret: 0, string: 4, duration: 2.0 },
                { fret: 2, string: 3, duration: 2.0 }
            ]
        },
        {
            measureNumber: 11,
            notes: [
                { fret: 3, string: 2, duration: 1.0 },
                { duration: 1.0 },
                { fret: 0, string: 1, duration: 2.0 }
            ]
        },
        {
            measureNumber: 12,
            notes: [
                { fret: 1, string: 2, duration: 0.5 },
                { fret: 3, string: 2, duration: 0.5 },
                { fret: 0, string: 1, duration: 1.0 },
                { fret: 1, string: 2, duration: 0.5 },
                { fret: 3, string: 2, duration: 0.5 },
                { fret: 0, string: 1, duration: 1.0 }
            ]
        },
        {
            measureNumber: 13,
            notes: [
                { fret: 3, string: 1, duration: 1.0 },
                { fret: 1, string: 1, duration: 1.0 },
                { fret: 0, string: 1, duration: 2.0 }
            ]
        },
        {
            measureNumber: 14,
            notes: [
                { duration: 0.5 },
                { fret: 2, string: 3, duration: 0.5 },
                { fret: 0, string: 2, duration: 1.0 },
                { duration: 0.5 },
                { fret: 2, string: 3, duration: 0.5 },
                { fret: 0, string: 2, duration: 1.0 }
            ]
        },
        {
            measureNumber: 15,
            notes: [{ fret: 3, string: 4, duration: 4.0 }]
        },
        {
            measureNumber: 16,
            notes: [
                { fret: 2, string: 3, duration: 1.0 },
                { fret: 0, string: 2, duration: 1.0 },
                { fret: 1, string: 2, duration: 1.0 },
                { fret: 3, string: 2, duration: 1.0 }
            ]
        },
        {
            measureNumber: 17,
            notes: [
                { fret: 0, string: 1, duration: 1.5 },
                { fret: 1, string: 1, duration: 0.5 },
                { fret: 3, string: 1, duration: 2.0 }
            ]
        },
        {
            measureNumber: 18,
            notes: [
                { fret: 5, string: 1, duration: 1.0 },
                { fret: 3, string: 1, duration: 1.0 },
                { fret: 1, string: 1, duration: 1.0 },
                { fret: 0, string: 1, duration: 1.0 }
            ]
        },
        {
            measureNumber: 19,
            notes: [{ fret: 3, string: 2, duration: 2.0 }, { duration: 2.0 }]
        },
        {
            measureNumber: 20,
            notes: [
                { fret: 0, string: 6, duration: 2.0 },
                { fret: 3, string: 6, duration: 2.0 }
            ]
        },
        {
            measureNumber: 21,
            notes: [
                { fret: 0, string: 5, duration: 2.0 },
                { fret: 3, string: 5, duration: 2.0 }
            ]
        },
        {
            measureNumber: 22,
            notes: [
                { fret: 2, string: 6, duration: 1.0 },
                { fret: 0, string: 5, duration: 1.0 },
                { fret: 2, string: 5, duration: 1.0 },
                { fret: 0, string: 4, duration: 1.0 }
            ]
        },
        {
            measureNumber: 23,
            notes: [{ fret: 2, string: 4, duration: 2.0 }, { duration: 2.0 }]
        },
        {
            measureNumber: 24,
            notes: [
                { fret: 1, string: 6, duration: 1.0 },
                { fret: 1, string: 6, duration: 1.0 },
                { fret: 0, string: 5, duration: 2.0 }
            ]
        },
        {
            measureNumber: 25,
            notes: [
                { fret: 2, string: 5, duration: 1.0 },
                { fret: 2, string: 5, duration: 1.0 },
                { fret: 0, string: 4, duration: 2.0 }
            ]
        },
        {
            measureNumber: 26,
            notes: [
                { fret: 3, string: 6, duration: 0.5 },
                { fret: 2, string: 6, duration: 0.5 },
                { fret: 0, string: 6, duration: 1.0 },
                { fret: 3, string: 5, duration: 0.5 },
                { fret: 2, string: 5, duration: 0.5 },
                { fret: 0, string: 5, duration: 1.0 }
            ]
        },
        {
            measureNumber: 27,
            notes: [{ fret: 2, string: 4, duration: 4.0 }]
        },
        {
            measureNumber: 28,
            notes: [
                { fret: 4, string: 6, duration: 1.0 },
                { fret: 0, string: 5, duration: 1.0 },
                { fret: 2, string: 5, duration: 1.0 },
                { fret: 4, string: 5, duration: 1.0 }
            ]
        },
        {
            measureNumber: 29,
            notes: [
                { fret: 0, string: 4, duration: 1.5 },
                { fret: 2, string: 4, duration: 0.5 },
                { fret: 4, string: 4, duration: 2.0 }
            ]
        },
        {
            measureNumber: 30,
            notes: [
                { fret: 0, string: 3, duration: 1.0 },
                { fret: 4, string: 4, duration: 1.0 },
                { fret: 2, string: 4, duration: 1.0 },
                { fret: 0, string: 4, duration: 1.0 }
            ]
        },
        {
            measureNumber: 31,
            notes: [
                { fret: 3, string: 5, duration: 2.0 },
                { fret: 0, string: 6, duration: 2.0 }
            ]
        },
        {
            measureNumber: 32,
            notes: [
                { fret: 12, string: 1, duration: 0.5 },
                { fret: 13, string: 1, duration: 0.5 },
                { fret: 15, string: 1, duration: 1.0 },
                { fret: 12, string: 2, duration: 0.5 },
                { fret: 13, string: 2, duration: 0.5 },
                { fret: 15, string: 2, duration: 1.0 }
            ]
        },
        {
            measureNumber: 33,
            notes: [
                { fret: 16, string: 1, duration: 2.0 },
                { fret: 19, string: 1, duration: 2.0 }
            ]
        },
        {
            measureNumber: 34,
            notes: [
                { fret: 17, string: 1, duration: 0.5 },
                { fret: 16, string: 1, duration: 0.5 },
                { fret: 14, string: 1, duration: 0.5 },
                { fret: 12, string: 1, duration: 0.5 },
                { duration: 1.0 },
                { fret: 12, string: 1, duration: 1.0 }
            ]
        },
        {
            measureNumber: 35,
            notes: [{ fret: 14, string: 2, duration: 4.0 }]
        },
        {
            measureNumber: 36,
            notes: [
                { fret: 12, string: 3, duration: 1.0 },
                { fret: 11, string: 3, duration: 1.0 },
                { fret: 12, string: 3, duration: 2.0 }
            ]
        },
        {
            measureNumber: 37,
            notes: [
                { fret: 14, string: 3, duration: 1.0 },
                { fret: 12, string: 2, duration: 1.0 },
                { fret: 13, string: 2, duration: 1.0 },
                { fret: 15, string: 2, duration: 1.0 }
            ]
        },
        {
            measureNumber: 38,
            notes: [
                { fret: 12, string: 1, duration: 0.25 },
                { fret: 13, string: 1, duration: 0.25 },
                { fret: 15, string: 1, duration: 0.25 },
                { fret: 17, string: 1, duration: 0.25 },
                { fret: 19, string: 1, duration: 1.0 },
                { duration: 2.0 }
            ]
        },
        {
            measureNumber: 39,
            notes: [{ fret: 12, string: 1, duration: 4.0 }]
        },
        {
            measureNumber: 40,
            notes: [
                { duration: 1.0 },
                { fret: 8, string: 1, duration: 1.0 },
                { fret: 7, string: 1, duration: 1.0 },
                { fret: 5, string: 1, duration: 1.0 }
            ]
        },
        {
            measureNumber: 41,
            notes: [
                { fret: 3, string: 1, duration: 1.5 },
                { fret: 2, string: 1, duration: 0.5 },
                { fret: 0, string: 1, duration: 2.0 }
            ]
        },
        {
            measureNumber: 42,
            notes: [
                { fret: 3, string: 2, duration: 1.0 },
                { fret: 1, string: 2, duration: 1.0 },
                { fret: 0, string: 2, duration: 1.0 },
                { fret: 2, string: 3, duration: 1.0 }
            ]
        },
        {
            measureNumber: 43,
            notes: [{ fret: 0, string: 3, duration: 4.0 }]
        },
        {
            measureNumber: 44,
            notes: [
                { fret: 0, string: 4, duration: 2.0 },
                { fret: 2, string: 3, duration: 2.0, tie: true }
            ]
        },
        {
            measureNumber: 45,
            notes: [
                { fret: 2, string: 3, duration: 1.5 },
                { fret: 0, string: 2, duration: 0.5 },
                { fret: 1, string: 2, duration: 2.0, tie: true }
            ]
        },
        {
            measureNumber: 46,
            notes: [
                { fret: 1, string: 2, duration: 1.0 },
                { fret: 3, string: 2, duration: 1.0 },
                { fret: 0, string: 1, duration: 2.0, tie: true }
            ]
        },
        {
            measureNumber: 47,
            notes: [{ fret: 0, string: 1, duration: 4.0 }]
        },
        {
            measureNumber: 48,
            notes: [
                { fret: 5, string: 1, duration: 2.0 },
                { fret: 7, string: 1, duration: 2.0, tie: true }
            ]
        },
        {
            measureNumber: 49,
            notes: [
                { fret: 7, string: 1, duration: 2.0 },
                { fret: 3, string: 1, duration: 2.0, tie: true }
            ]
        },
        {
            measureNumber: 50,
            notes: [
                { fret: 3, string: 1, duration: 1.0 },
                { fret: 2, string: 1, duration: 1.0 },
                { fret: 0, string: 1, duration: 2.0, tie: true }
            ]
        },
        {
            measureNumber: 51,
            notes: [{ fret: 0, string: 1, duration: 4.0 }]
        },
        {
            measureNumber: 52,
            notes: [
                { fret: 3, string: 2, duration: 2.0 },
                { fret: 2, string: 3, duration: 2.0, tie: true }
            ]
        },
        {
            measureNumber: 53,
            notes: [
                { fret: 2, string: 3, duration: 2.0 },
                { fret: 0, string: 4, duration: 2.0, tie: true }
            ]
        },
        {
            measureNumber: 54,
            notes: [{ fret: 0, string: 4, duration: 4.0, tie: true }]
        },
        {
            measureNumber: 55,
            notes: [
                { fret: 0, string: 4, duration: 2.0, voice: 2 },
                { fret: 0, string: 4, duration: 2.0, voice: 1 }
            ]
        }
    ]
};

export const dummyScore24 = {
    id: "marching_pattern_24",
    instrument: "Guitalele",
    title: "2/4 Marching Pattern",
    description:
        "A punchy, quick-step progression to test short measures and rapid row-wrapping.",
    timeSignature: "2/4",
    measures: [
        {
            measureNumber: 1,
            notes: [
                { fret: 0, string: 6, duration: 1.0 },
                { fret: 2, string: 5, duration: 1.0 }
            ]
        },
        {
            measureNumber: 2,
            notes: [
                { fret: 0, string: 4, duration: 0.5 },
                { fret: 2, string: 4, duration: 0.5 },
                { fret: 0, string: 3, duration: 1.0 }
            ]
        },
        {
            measureNumber: 3,
            notes: [
                { fret: 2, string: 3, duration: 1.5 },
                { fret: 0, string: 2, duration: 0.5 }
            ]
        },
        {
            measureNumber: 4,
            notes: [{ fret: 1, string: 2, duration: 2.0 }]
        },
        {
            measureNumber: 5,
            notes: [
                { fret: 0, string: 1, duration: 0.25 },
                { fret: 1, string: 1, duration: 0.25 },
                { fret: 3, string: 1, duration: 0.25 },
                { fret: 5, string: 1, duration: 0.25 },
                { fret: 0, string: 2, duration: 1.0 }
            ]
        },
        {
            measureNumber: 6,
            notes: [{ duration: 1.0 }, { fret: 0, string: 4, duration: 1.0 }]
        },
        {
            measureNumber: 7,
            notes: [
                {
                    duration: 2.0,
                    pitches: [
                        { fret: 3, string: 6 },
                        { fret: 2, string: 5 },
                        { fret: 0, string: 4 },
                        { fret: 0, string: 3 },
                        { fret: 0, string: 2 },
                        { fret: 14, string: 1 }
                    ]
                }
            ]
        }
    ]
};

export const dummyScore34 = {
    id: "34_waltz_excerpt",
    title: "3/4 Waltz Excerpt",
    description:
        "A sweeping arpeggio block focusing on 3-beat divisions and dotted notes.",
    timeSignature: "3/4",
    measures: [
        {
            measureNumber: 1,
            notes: [
                { fret: 0, string: 5, duration: 1.0 },
                { fret: 2, string: 4, duration: 1.0 },
                { fret: 2, string: 3, duration: 1.0 }
            ]
        },
        {
            measureNumber: 2,
            notes: [
                { fret: 3, string: 5, duration: 1.5 },
                { fret: 0, string: 4, duration: 0.5 },
                { fret: 0, string: 3, duration: 1.0 }
            ]
        },
        {
            measureNumber: 3,
            notes: [
                { duration: 1.0 },
                { fret: 0, string: 2, duration: 0.5 },
                { fret: 1, string: 2, duration: 0.5 },
                { fret: 3, string: 2, duration: 1.0 }
            ]
        },
        {
            measureNumber: 4,
            notes: [{ fret: 0, string: 1, duration: 3.0 }]
        },
        {
            measureNumber: 5,
            notes: [
                { fret: 5, string: 1, duration: 2.0 },
                { fret: 3, string: 1, duration: 1.0, tie: true }
            ]
        },
        {
            measureNumber: 6,
            notes: [{ fret: 3, string: 1, duration: 3.0 }]
        }
    ]
};

export const dummyScore68 = {
    id: "68_arpeggio_flow",
    title: "6/8 Arpeggio Flow",
    description:
        "Flowing 6-beat cascading notes. Demonstrates longer horizontal measure stretching.",
    timeSignature: "6/8",
    measures: [
        {
            measureNumber: 1,
            notes: [
                { fret: 0, string: 6, duration: 0.5 },
                { fret: 2, string: 5, duration: 0.5 },
                { fret: 0, string: 4, duration: 0.5 },
                { fret: 2, string: 4, duration: 0.5 },
                { fret: 0, string: 3, duration: 0.5 },
                { fret: 2, string: 3, duration: 0.5 }
            ]
        },
        {
            measureNumber: 2,
            notes: [
                { fret: 0, string: 5, duration: 1.0 },
                { fret: 2, string: 4, duration: 0.5 },
                { fret: 0, string: 3, duration: 1.5 }
            ]
        },
        {
            measureNumber: 3,
            notes: [
                { fret: 1, string: 2, duration: 0.75 },
                { fret: 3, string: 2, duration: 0.75 },
                { duration: 0.5 },
                { fret: 0, string: 1, duration: 1.0 }
            ]
        },
        {
            measureNumber: 4,
            notes: [{ fret: 5, string: 1, duration: 3.0 }]
        }
    ]
};

export const dummyScore22 = {
    id: "22_cut_time_fanfare",
    title: "2/2 Cut Time Fanfare",
    description:
        "A brisk, driving march in Cut Time. Note that each measure sums to 4.0 beats total to ensure correct barline placement.",
    timeSignature: "2/2",
    measures: [
        {
            measureNumber: 1,
            notes: [
                { fret: 0, string: 6, duration: 2.0 },
                { fret: 2, string: 5, duration: 2.0 }
            ]
        },
        {
            measureNumber: 2,
            notes: [
                { fret: 0, string: 4, duration: 1.0 },
                { fret: 2, string: 4, duration: 1.0 },
                { fret: 0, string: 3, duration: 1.0 },
                { fret: 2, string: 3, duration: 1.0 }
            ]
        },
        {
            measureNumber: 3,
            notes: [
                { fret: 3, string: 5, duration: 3.0 },
                { fret: 0, string: 4, duration: 1.0 }
            ]
        },
        {
            measureNumber: 4,
            notes: [{ fret: 1, string: 2, duration: 4.0 }]
        },
        {
            measureNumber: 5,
            notes: [
                { fret: 0, string: 1, duration: 0.5 },
                { fret: 1, string: 1, duration: 0.5 },
                { fret: 3, string: 1, duration: 0.5 },
                { fret: 5, string: 1, duration: 0.5 },
                { fret: 0, string: 2, duration: 2.0 }
            ]
        },
        {
            measureNumber: 6,
            notes: [
                { fret: 3, string: 3, duration: 2.0 },
                { fret: 0, string: 4, duration: 2.0 }
            ]
        }
    ]
};

const many_ties_score = {
    id: "many_ties_score",
    title: "Many Ties Score",
    description:
        "A score designed to test the handling of multiple tied notes across measures.",
    timeSignature: "4/4",
    measures: [
        {
            measureNumber: 1,
            notes: [
                { fret: 3, string: 1, duration: 2.0, tie: true },
                { fret: 5, string: 1, duration: 2.0 }
            ]
        },
        {
            measureNumber: 2,
            notes: [
                { fret: 3, string: 1, duration: 2.0, tie: true },
                { fret: 3, string: 1, duration: 1.0 },
                { fret: 5, string: 1, duration: 1.0 }
            ]
        },
        {
            measureNumber: 3,
            notes: [
                { fret: 2, string: 1, duration: 2.0, tie: true },
                { fret: 2, string: 1, duration: 1.0 },
                { fret: 5, string: 1, duration: 1.0 }
            ]
        },
        {
            measureNumber: 4,
            notes: [{ fret: 1, string: 2, duration: 4.0 }]
        },
        {
            measureNumber: 5,
            notes: [
                { fret: 7, string: 1, duration: 2.0, tie: true },
                { fret: 3, string: 1, duration: 2.0 }
            ]
        },
        {
            measureNumber: 6,
            notes: [
                { fret: 2, string: 1, duration: 2.0, tie: true },
                { fret: 7, string: 1, duration: 2.0 }
            ]
        }
    ]
};

export const allScores = [
    dummyScore,
    dummyScore34,
    dummyScore68,
    dummyScore22,
    two_voice_test,
    many_ties_score,
    dummyScore24
];
