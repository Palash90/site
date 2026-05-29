const two_voice_test = {
  "id": "two_voice_test",
  "title": "Two Voice Separation Demo",
  "timeSignature": "4/4",
  "notes": [
    // === MEASURE 1 ===
    {
      "duration": 4.0,
      "pitches": [
        { "fret": 3, "string": 6 }, // C3
        { "fret": 2, "string": 5 }, // E3
        { "fret": 0, "string": 4 }, // G3
        { "fret": 0, "string": 3 }, // C4
        { "fret": 0, "string": 2 }, // E4
        { "fret": 14, "string": 1 }  // C5
      ]
    },

    // Voice 2: Plays an intricate melody over those 4 beats
    { "fret": 0, "string": 1, "duration": 1.0, "voice": 2 },
    { "fret": 2, "string": 1, "duration": 1.0, "voice": 2 },
    { "fret": 3, "string": 2, "duration": 0.5, "voice": 2 },
    { "fret": 1, "string": 2, "duration": 0.5, "voice": 2 },
    { "fret": 0, "string": 3, "duration": 1.0, "voice": 2 },
    // Measure 1 totals: Voice 1 (4.0 beats), Voice 2 (1 + 1 + 0.5 + 0.5 + 1 = 4.0 beats)

    // === MEASURE 2 ===
    // Voice 1: Bass line using two half notes
    { "fret": 2, "string": 6, "duration": 2.0, "voice": 1 },
    { "fret": 0, "string": 5, "duration": 2.0, "voice": 1 },

    // Voice 2: Melody resting for 2 beats, then playing 2 beats
    { "duration": 2.0, "voice": 2 }, // This acts as a rest
    { "fret": 5, "string": 1, "duration": 1.0, "voice": 2 },
    { "fret": 7, "string": 1, "duration": 1.0, "voice": 2 }
  ]
}

const dummyScore = {
  "id": "full_test_score",
  "title": "Guitalele Tab viewer Full Test Score",
  "description": "Comprehensive 52-measure composition covering extreme upper/lower staff boundaries, dynamic rhythms, and true horizontal layout tracking.",
  "timeSignature": "4/4",
  "notes": [
    // === TWO-VOICE DEMONSTRATION (Measures 1 - 3) ===
    // Measure 1: Voice 1 with whole notes, Voice 2 with quarter notes
    // Voice 1: C whole note (4 beats)
    { "fret": 0, "string": 3, "duration": 4.0, "voice": 1 }, // C whole note

    // Voice 2: C, D, F, A quarter notes (1 beat each = 4 beats)
    { "fret": 0, "string": 1, "duration": 1.0, "voice": 2 },
    { "fret": 2, "string": 1, "duration": 1.0, "voice": 2 },
    { "fret": 3, "string": 2, "duration": 1.0, "voice": 2 },
    { "fret": 0, "string": 3, "duration": 1.0, "voice": 2 }, // Measure 1 Done

    // Measure 2: Voice 1 with two half notes, Voice 2 with four quarter notes
    { "fret": 2, "string": 3, "duration": 2.0, "voice": 1 }, // Half note
    { "fret": 3, "string": 2, "duration": 2.0, "voice": 1 }, // Half note

    { "fret": 5, "string": 1, "duration": 1.0, "voice": 2 },
    { "fret": 7, "string": 1, "duration": 1.0, "voice": 2 },
    { "fret": 5, "string": 2, "duration": 1.0, "voice": 2 },
    { "fret": 3, "string": 2, "duration": 1.0, "voice": 2 }, // Measure 2 Done

    // Measure 3: Voice 1 with quarter notes, Voice 2 with eighth notes
    { "fret": 0, "string": 1, "duration": 1.0, "voice": 1 },
    { "fret": 2, "string": 1, "duration": 1.0, "voice": 1 },
    { "fret": 3, "string": 1, "duration": 1.0, "voice": 1 },
    { "fret": 0, "string": 2, "duration": 1.0, "voice": 1 },

    { "fret": 0, "string": 1, "duration": 0.5, "voice": 2 },
    { "fret": 1, "string": 1, "duration": 0.5, "voice": 2 },
    { "fret": 2, "string": 1, "duration": 0.5, "voice": 2 },
    { "fret": 3, "string": 1, "duration": 0.5, "voice": 2 },
    { "fret": 0, "string": 2, "duration": 0.5, "voice": 2 },
    { "fret": 1, "string": 2, "duration": 0.5, "voice": 2 },
    { "fret": 2, "string": 2, "duration": 0.5, "voice": 2 },
    { "fret": 3, "string": 2, "duration": 0.5, "voice": 2 }, // Measure 3 Done (8 eighths = 4 beats)

    // === SECTION 1: NORMAL SINGLE-VOICE MOTIF (Measures 4 - 7) ===
    { "fret": 0, "string": 6, "duration": 1.0 },
    { "fret": 2, "string": 6, "duration": 1.0 },
    { "fret": 0, "string": 5, "duration": 1.0 },
    { "fret": 2, "string": 5, "duration": 1.0 }, // Measure 4 Done

    { "fret": 0, "string": 4, "duration": 1.0 },
    { "fret": 2, "string": 4, "duration": 1.0 },
    { "fret": 0, "string": 3, "duration": 1.0 },
    { "fret": 2, "string": 3, "duration": 1.0 }, // Measure 5 Done

    { "fret": 0, "string": 2, "duration": 0.5 },
    { "fret": 1, "string": 2, "duration": 0.5 },
    { "duration": 1.0 },
    { "fret": 3, "string": 2, "duration": 1.0, "tie": true },
    { "fret": 3, "string": 2, "duration": 1.0 }, // Measure 6 Done

    { "fret": 0, "string": 1, "duration": 1.0 },
    { "duration": 0.5 },
    { "fret": 5, "string": 1, "duration": 0.5 },
    { "duration": 0.25 },
    { "fret": 7, "string": 1, "duration": 0.25 },
    { "fret": 12, "string": 1, "duration": 1.5 }, // Measure 7 Done

    // === SECTION 2: THE MID-REGISTER SYNCOPATION (Measures 8 - 19) ===
    // Repeatable pattern block 1 (Measures 8-11)
    { "fret": 3, "string": 3, "duration": 1.0 },
    { "fret": 2, "string": 2, "duration": 0.5 },
    { "fret": 0, "string": 1, "duration": 0.5 },
    { "duration": 1.0 },
    { "fret": 2, "string": 2, "duration": 1.0 }, // M8
    { "fret": 3, "string": 3, "duration": 1.0 },
    { "fret": 2, "string": 2, "duration": 0.5 },
    { "fret": 0, "string": 1, "duration": 0.5 },
    { "duration": 1.0 },
    { "fret": 2, "string": 2, "duration": 1.0 }, // M9
    { "fret": 0, "string": 4, "duration": 2.0 },
    { "fret": 2, "string": 3, "duration": 2.0 }, // M10
    { "fret": 3, "string": 2, "duration": 1.0 },
    { "duration": 1.0 },
    { "fret": 0, "string": 1, "duration": 2.0 }, // M11

    // Repeatable pattern block 2 (Measures 12-15)
    { "fret": 1, "string": 2, "duration": 0.5 },
    { "fret": 3, "string": 2, "duration": 0.5 },
    { "fret": 0, "string": 1, "duration": 1.0 },
    { "fret": 1, "string": 2, "duration": 0.5 },
    { "fret": 3, "string": 2, "duration": 0.5 },
    { "fret": 0, "string": 1, "duration": 1.0 }, // M12
    { "fret": 3, "string": 1, "duration": 1.0 },
    { "fret": 1, "string": 1, "duration": 1.0 },
    { "fret": 0, "string": 1, "duration": 2.0 }, // M13
    { "duration": 0.5 },
    { "fret": 2, "string": 3, "duration": 0.5 },
    { "fret": 0, "string": 2, "duration": 1.0 },
    { "duration": 0.5 },
    { "fret": 2, "string": 3, "duration": 0.5 },
    { "fret": 0, "string": 2, "duration": 1.0 }, // M14
    { "fret": 3, "string": 4, "duration": 4.0 }, // M15

    // Transition block (Measures 16-19)
    { "fret": 2, "string": 3, "duration": 1.0 },
    { "fret": 0, "string": 2, "duration": 1.0 },
    { "fret": 1, "string": 2, "duration": 1.0 },
    { "fret": 3, "string": 2, "duration": 1.0 }, // M16
    { "fret": 0, "string": 1, "duration": 1.5 },
    { "fret": 1, "string": 1, "duration": 0.5 },
    { "fret": 3, "string": 1, "duration": 2.0 }, // M17
    { "fret": 5, "string": 1, "duration": 1.0 },
    { "fret": 3, "string": 1, "duration": 1.0 },
    { "fret": 1, "string": 1, "duration": 1.0 },
    { "fret": 0, "string": 1, "duration": 1.0 }, // M18
    { "fret": 3, "string": 2, "duration": 2.0 },
    { "duration": 2.0 }, // M19

    // === SECTION 3: BASS REGISTRATION MOTIF (Measures 20 - 31) ===
    { "fret": 0, "string": 6, "duration": 2.0 },
    { "fret": 3, "string": 6, "duration": 2.0 }, // M20
    { "fret": 0, "string": 5, "duration": 2.0 },
    { "fret": 3, "string": 5, "duration": 2.0 }, // M21
    { "fret": 2, "string": 6, "duration": 1.0 },
    { "fret": 0, "string": 5, "duration": 1.0 },
    { "fret": 2, "string": 5, "duration": 1.0 },
    { "fret": 0, "string": 4, "duration": 1.0 }, // M22
    { "fret": 2, "string": 4, "duration": 2.0 },
    { "duration": 2.0 }, // M23

    { "fret": 1, "string": 6, "duration": 1.0 },
    { "fret": 1, "string": 6, "duration": 1.0 },
    { "fret": 0, "string": 5, "duration": 2.0 }, // M24
    { "fret": 2, "string": 5, "duration": 1.0 },
    { "fret": 2, "string": 5, "duration": 1.0 },
    { "fret": 0, "string": 4, "duration": 2.0 }, // M25
    { "fret": 3, "string": 6, "duration": 0.5 },
    { "fret": 2, "string": 6, "duration": 0.5 },
    { "fret": 0, "string": 6, "duration": 1.0 },
    { "fret": 3, "string": 5, "duration": 0.5 },
    { "fret": 2, "string": 5, "duration": 0.5 },
    { "fret": 0, "string": 5, "duration": 1.0 }, // M23
    { "fret": 2, "string": 4, "duration": 4.0 }, // M24

    { "fret": 4, "string": 6, "duration": 1.0 },
    { "fret": 0, "string": 5, "duration": 1.0 },
    { "fret": 2, "string": 5, "duration": 1.0 },
    { "fret": 4, "string": 5, "duration": 1.0 }, // M25
    { "fret": 0, "string": 4, "duration": 1.5 },
    { "fret": 2, "string": 4, "duration": 0.5 },
    { "fret": 4, "string": 4, "duration": 2.0 }, // M26
    { "fret": 0, "string": 3, "duration": 1.0 },
    { "fret": 4, "string": 4, "duration": 1.0 },
    { "fret": 2, "string": 4, "duration": 1.0 },
    { "fret": 0, "string": 4, "duration": 1.0 }, // M27
    { "fret": 3, "string": 5, "duration": 2.0 },
    { "fret": 0, "string": 6, "duration": 2.0 }, // M28

    // === SECTION 4: PAST THE 12th FRET STRATOSPHERE (Measures 29 - 40) ===
    { "fret": 12, "string": 1, "duration": 0.5 },
    { "fret": 13, "string": 1, "duration": 0.5 },
    { "fret": 15, "string": 1, "duration": 1.0 },
    { "fret": 12, "string": 2, "duration": 0.5 },
    { "fret": 13, "string": 2, "duration": 0.5 },
    { "fret": 15, "string": 2, "duration": 1.0 }, // M29
    { "fret": 16, "string": 1, "duration": 2.0 },
    { "fret": 19, "string": 1, "duration": 2.0 }, // M30
    { "fret": 17, "string": 1, "duration": 0.5 },
    { "fret": 16, "string": 1, "duration": 0.5 },
    { "fret": 14, "string": 1, "duration": 0.5 },
    { "fret": 12, "string": 1, "duration": 0.5 },
    { "duration": 1.0 },
    { "fret": 12, "string": 1, "duration": 1.0 }, // M31
    { "fret": 14, "string": 2, "duration": 4.0 }, // M32

    { "fret": 12, "string": 3, "duration": 1.0 },
    { "fret": 11, "string": 3, "duration": 1.0 },
    { "fret": 12, "string": 3, "duration": 2.0 }, // M33
    { "fret": 14, "string": 3, "duration": 1.0 },
    { "fret": 12, "string": 2, "duration": 1.0 },
    { "fret": 13, "string": 2, "duration": 1.0 },
    { "fret": 15, "string": 2, "duration": 1.0 }, // M34
    { "fret": 12, "string": 1, "duration": 0.25 },
    { "fret": 13, "string": 1, "duration": 0.25 },
    { "fret": 15, "string": 1, "duration": 0.25 },
    { "fret": 17, "string": 1, "duration": 0.25 },
    { "fret": 19, "string": 1, "duration": 1.0 },
    { "duration": 2.0 }, // M35
    { "fret": 12, "string": 1, "duration": 4.0 }, // M36

    { "duration": 1.0 },
    { "fret": 8, "string": 1, "duration": 1.0 },
    { "fret": 7, "string": 1, "duration": 1.0 },
    { "fret": 5, "string": 1, "duration": 1.0 }, // M37
    { "fret": 3, "string": 1, "duration": 1.5 },
    { "fret": 2, "string": 1, "duration": 0.5 },
    { "fret": 0, "string": 1, "duration": 2.0 }, // M38
    { "fret": 3, "string": 2, "duration": 1.0 },
    { "fret": 1, "string": 2, "duration": 1.0 },
    { "fret": 0, "string": 2, "duration": 1.0 },
    { "fret": 2, "string": 3, "duration": 1.0 }, // M39
    { "fret": 0, "string": 3, "duration": 4.0 }, // M40

    // === SECTION 5: SUS-GRAND FINALE WITH ACROSS-BAR TIES (Measures 41 - 52) ===
    { "fret": 0, "string": 4, "duration": 2.0 },
    { "fret": 2, "string": 3, "duration": 2.0, "tie": true }, // M41
    { "fret": 2, "string": 3, "duration": 1.5 },
    { "fret": 0, "string": 2, "duration": 0.5 },
    { "fret": 1, "string": 2, "duration": 2.0, "tie": true }, // M42
    { "fret": 1, "string": 2, "duration": 1.0 },
    { "fret": 3, "string": 2, "duration": 1.0 },
    { "fret": 0, "string": 1, "duration": 2.0, "tie": true }, // M43
    { "fret": 0, "string": 1, "duration": 4.0 }, // M44

    { "fret": 5, "string": 1, "duration": 2.0 },
    { "fret": 7, "string": 1, "duration": 2.0, "tie": true }, // M45
    { "fret": 7, "string": 1, "duration": 2.0 },
    { "fret": 3, "string": 1, "duration": 2.0, "tie": true }, // M46
    { "fret": 3, "string": 1, "duration": 1.0 },
    { "fret": 2, "string": 1, "duration": 1.0 },
    { "fret": 0, "string": 1, "duration": 2.0, "tie": true }, // M47
    { "fret": 0, "string": 1, "duration": 4.0 }, // M48

    { "fret": 3, "string": 2, "duration": 2.0 },
    { "fret": 2, "string": 3, "duration": 2.0, "tie": true }, // M49
    { "fret": 2, "string": 3, "duration": 2.0 },
    { "fret": 0, "string": 4, "duration": 2.0, "tie": true }, // M50
    { "fret": 0, "string": 4, "duration": 4.0, "tie": true }, // M51
    { "fret": 0, "string": 4, "duration": 4.0 }  // M52 Final Chord Resonator
  ]
};

const dummyScore24 = {
  "id": "marching_pattern_24",
  "title": "2/4 Marching Pattern",
  "description": "A punchy, quick-step progression to test short measures and rapid row-wrapping.",
  "timeSignature": "2/4",
  "notes": [
    // === MEASURE 1 (2.0 Beats) ===
    { "fret": 0, "string": 6, "duration": 1.0 },
    { "fret": 2, "string": 5, "duration": 1.0 },

    // === MEASURE 2 (2.0 Beats) ===
    { "fret": 0, "string": 4, "duration": 0.5 },
    { "fret": 2, "string": 4, "duration": 0.5 },
    { "fret": 0, "string": 3, "duration": 1.0 },

    // === MEASURE 3 (2.0 Beats) ===
    { "fret": 2, "string": 3, "duration": 1.5 },
    { "fret": 0, "string": 2, "duration": 0.5 },

    // === MEASURE 4 (2.0 Beats) ===
    { "fret": 1, "string": 2, "duration": 2.0 },

    // === MEASURE 5 (2.0 Beats) ===
    { "fret": 0, "string": 1, "duration": 0.25 },
    { "fret": 1, "string": 1, "duration": 0.25 },
    { "fret": 3, "string": 1, "duration": 0.25 },
    { "fret": 5, "string": 1, "duration": 0.25 },
    { "fret": 0, "string": 2, "duration": 1.0 },

    // === MEASURE 6 (2.0 Beats) ===
    { "duration": 1.0 }, // Rest
    { "fret": 0, "string": 4, "duration": 1.0 },

    // === MEASURE 7 (2.0 Beats) - C MAJOR CHORD ===
    {
      "duration": 2.0,
      "pitches": [
        { "fret": 3, "string": 6 }, // C3
        { "fret": 2, "string": 5 }, // E3
        { "fret": 0, "string": 4 }, // G3
        { "fret": 0, "string": 3 }, // C4
        { "fret": 0, "string": 2 }, // E4
        { "fret": 14, "string": 1 }  // C5
      ]
    }
  ]
};

const maryHadALittleLamb = {
  "id": "mary_had_a_little_lamb",
  "title": "Mary Had a Little Lamb",
  "description": "A classic nursery rhyme arrangement mapped accurately to standard Guitalele tuning (ADGCEA).",
  "timeSignature": "2/4",
  "notes": [
    // === MEASURE 1 (2.0 Beats) ===
    // Ma- ry (E4, D4)
    { "fret": 4, "string": 3, "duration": 1.0 },
    { "fret": 2, "string": 3, "duration": 1.0 },

    // === MEASURE 2 (2.0 Beats) ===
    // had a (C4, D4)
    { "fret": 0, "string": 3, "duration": 1.0 },
    { "fret": 2, "string": 3, "duration": 1.0 },

    // === MEASURE 3 (2.0 Beats) ===
    // lit- tle (E4, E4)
    { "fret": 4, "string": 3, "duration": 1.0 },
    { "fret": 4, "string": 3, "duration": 1.0 },

    // === MEASURE 4 (2.0 Beats) ===
    // lamb (E4)
    { "fret": 4, "string": 3, "duration": 2.0 },

    // === MEASURE 5 (2.0 Beats) ===
    // lit- tle (D4, D4)
    { "fret": 2, "string": 3, "duration": 1.0 },
    { "fret": 2, "string": 3, "duration": 1.0 },

    // === MEASURE 6 (2.0 Beats) ===
    // lamb (D4)
    { "fret": 2, "string": 3, "duration": 2.0 },

    // === MEASURE 7 (2.0 Beats) ===
    // lit- tle (E4, G4)
    { "fret": 4, "string": 3, "duration": 1.0 },
    { "fret": 3, "string": 2, "duration": 1.0 },

    // === MEASURE 8 (2.0 Beats) ===
    // lamb (G4)
    { "fret": 3, "string": 2, "duration": 2.0 },

    // === MEASURE 9 (2.0 Beats) ===
    // Ma- ry (E4, D4)
    { "fret": 4, "string": 3, "duration": 1.0 },
    { "fret": 2, "string": 3, "duration": 1.0 },

    // === MEASURE 10 (2.0 Beats) ===
    // had a (C4, D4)
    { "fret": 0, "string": 3, "duration": 1.0 },
    { "fret": 2, "string": 3, "duration": 1.0 },

    // === MEASURE 11 (2.0 Beats) ===
    // lit- tle (E4, E4)
    { "fret": 4, "string": 3, "duration": 1.0 },
    { "fret": 4, "string": 3, "duration": 1.0 },

    // === MEASURE 12 (2.0 Beats) ===
    // lamb, its (E4, E4)
    { "fret": 4, "string": 3, "duration": 1.0 },
    { "fret": 4, "string": 3, "duration": 1.0 },

    // === MEASURE 13 (2.0 Beats) ===
    // fleece was (D4, D4)
    { "fret": 2, "string": 3, "duration": 1.0 },
    { "fret": 2, "string": 3, "duration": 1.0 },

    // === MEASURE 14 (2.0 Beats) ===
    // white as (E4, D4)
    { "fret": 4, "string": 3, "duration": 1.0 },
    { "fret": 2, "string": 3, "duration": 1.0 },

    // === MEASURE 15 (2.0 Beats) ===
    // snow (C4)
    { "fret": 0, "string": 3, "duration": 2.0 }
  ]
};

const twinkleTwinkleLittleStar = {
  "id": "twinkle_twinkle_little_star",
  "title": "Twinkle Twinkle Little Star",
  "description": "A classic nursery rhyme arrangement mapped to standard Guitalele tuning (ADGCEA).",
  "timeSignature": "4/4",
  "notes": [
    // === MEASURE 1 ===
    // Twin- kle, Twin- kle (C4, C4, G4, G4)
    { "fret": 0, "string": 3, "duration": 1.0 },
    { "fret": 0, "string": 3, "duration": 1.0 },
    { "fret": 3, "string": 2, "duration": 1.0 },
    { "fret": 3, "string": 2, "duration": 1.0 },

    // === MEASURE 2 ===
    // Lit- tle, Star (A4, A4, G4)
    { "fret": 5, "string": 2, "duration": 1.0 },
    { "fret": 5, "string": 2, "duration": 1.0 },
    { "fret": 3, "string": 2, "duration": 2.0 },

    // === MEASURE 3 ===
    // How I, won- der (F4, F4, E4, E4)
    { "fret": 1, "string": 2, "duration": 1.0 },
    { "fret": 1, "string": 2, "duration": 1.0 },
    { "fret": 0, "string": 2, "duration": 1.0 },
    { "fret": 0, "string": 2, "duration": 1.0 },

    // === MEASURE 4 ===
    // what you, are (D4, D4, C4)
    { "fret": 2, "string": 3, "duration": 1.0 },
    { "fret": 2, "string": 3, "duration": 1.0 },
    { "fret": 0, "string": 3, "duration": 2.0 }
  ]
};

const dummyScore34 = {
  "id": "34_waltz_excerpt",
  "title": "3/4 Waltz Excerpt",
  "description": "A sweeping arpeggio block focusing on 3-beat divisions and dotted notes.",
  "timeSignature": "3/4",
  "notes": [
    // === MEASURE 1 (3.0 Beats) ===
    { "fret": 0, "string": 5, "duration": 1.0 },
    { "fret": 2, "string": 4, "duration": 1.0 },
    { "fret": 2, "string": 3, "duration": 1.0 },

    // === MEASURE 2 (3.0 Beats) ===
    { "fret": 3, "string": 5, "duration": 1.5 },
    { "fret": 0, "string": 4, "duration": 0.5 },
    { "fret": 0, "string": 3, "duration": 1.0 },

    // === MEASURE 3 (3.0 Beats) ===
    { "duration": 1.0 }, // Rest
    { "fret": 0, "string": 2, "duration": 0.5 },
    { "fret": 1, "string": 2, "duration": 0.5 },
    { "fret": 3, "string": 2, "duration": 1.0 },

    // === MEASURE 4 (3.0 Beats) ===
    { "fret": 0, "string": 1, "duration": 3.0 },

    // === MEASURE 5 (3.0 Beats) ===
    { "fret": 5, "string": 1, "duration": 2.0 },
    { "fret": 3, "string": 1, "duration": 1.0, "tie": true },

    // === MEASURE 6 (3.0 Beats) ===
    { "fret": 3, "string": 1, "duration": 3.0 }
  ]
};

const dummyScore68 = {
  "id": "68_arpeggio_flow",
  "title": "6/8 Arpeggio Flow",
  "description": "Flowing 6-beat cascading notes. Demonstrates longer horizontal measure stretching.",
  "timeSignature": "6/8",
  "notes": [
    // === MEASURE 1 (6.0 Beats) ===
    { "fret": 0, "string": 6, "duration": 0.5 },
    { "fret": 2, "string": 5, "duration": 0.5 },
    { "fret": 0, "string": 4, "duration": 0.5 },
    { "fret": 2, "string": 4, "duration": 0.5 },
    { "fret": 0, "string": 3, "duration": 0.5 },
    { "fret": 2, "string": 3, "duration": 0.5 },

    // === MEASURE 2 (6.0 Beats) ===
    { "fret": 0, "string": 5, "duration": 1.0 },
    { "fret": 2, "string": 4, "duration": 0.5 },
    { "fret": 0, "string": 3, "duration": 1.5 },

    // === MEASURE 3 (6.0 Beats) ===
    { "fret": 1, "string": 2, "duration": 0.75 },
    { "fret": 3, "string": 2, "duration": 0.75 },
    { "duration": 0.5 }, // Rest
    { "fret": 0, "string": 1, "duration": 1.0 },

    // === MEASURE 4 (6.0 Beats) ===
    { "fret": 5, "string": 1, "duration": 3.0 }
  ]
};

const dummyScore22 = {
  "id": "22_cut_time_fanfare",
  "title": "2/2 Cut Time Fanfare",
  "description": "A brisk, driving march in Cut Time. Note that each measure sums to 4.0 beats total to ensure correct barline placement.",
  "timeSignature": "2/2",
  "notes": [
    // === MEASURE 1 (4.0 total: Two half notes) ===
    { "fret": 0, "string": 6, "duration": 2.0 },
    { "fret": 2, "string": 5, "duration": 2.0 },

    // === MEASURE 2 (4.0 total: Four quarter notes) ===
    { "fret": 0, "string": 4, "duration": 1.0 },
    { "fret": 2, "string": 4, "duration": 1.0 },
    { "fret": 0, "string": 3, "duration": 1.0 },
    { "fret": 2, "string": 3, "duration": 1.0 },

    // === MEASURE 3 (4.0 total: Dotted half + Quarter) ===
    { "fret": 3, "string": 5, "duration": 3.0 },
    { "fret": 0, "string": 4, "duration": 1.0 },

    // === MEASURE 4 (4.0 total: Whole note resonator) ===
    { "fret": 1, "string": 2, "duration": 4.0 },

    // === MEASURE 5 (4.0 total: Eighth note flourishes) ===
    { "fret": 0, "string": 1, "duration": 0.5 },
    { "fret": 1, "string": 1, "duration": 0.5 },
    { "fret": 3, "string": 1, "duration": 0.5 },
    { "fret": 5, "string": 1, "duration": 0.5 },
    { "fret": 0, "string": 2, "duration": 2.0 },

    // === MEASURE 6 (4.0 total: Final cadence) ===
    { "fret": 3, "string": 3, "duration": 2.0 },
    { "fret": 0, "string": 4, "duration": 2.0 }
  ]
};

export const allScores = [dummyScore, maryHadALittleLamb, twinkleTwinkleLittleStar, dummyScore34, dummyScore68, dummyScore22, two_voice_test]