// Helper to parse fret characters preventing undefined/null errors
const parseFretValue = fretStr => {
    if (!fretStr) return null;
    const cleanFret = fretStr.trim().toUpperCase();
    if (cleanFret === "O") return 0;
    if (cleanFret === "X") return null;
    return parseInt(cleanFret, 10);
};

const durationMap = {
    s: 0.25, // Sixteenth
    e: 0.5, // Eighth
    "e.": 0.75, // Dotted Eighth
    q: 1.0, // Quarter
    "q.": 1.5, // Dotted Quarter
    h: 2.0, // Half
    "h.": 3.0, // Dotted Half
    w: 4.0, // Whole
    "w.": 6.0 // Dotted Whole
};

// Helper to parse individual note/rest/chord tokens cleanly
export const parseToken = (token, capo = 0) => {
    const event = { duration: 1.0 }; // Default fallback
    let workingToken = token.trim();

    // 1. Extract Description (d:...) from the end of the token safely
    const descIndex = workingToken.indexOf("d:");
    if (descIndex !== -1) {
        event.description = workingToken.substring(descIndex + 2);
        workingToken = workingToken.substring(0, descIndex);
    }

    // 2. Extract Tie flag
    if (workingToken.includes("t")) {
        event.tie = true;
        workingToken = workingToken.replace("t", "");
    }

    // 3. Extract Voice flag
    const voiceMatch = workingToken.match(/v(\d+)/);
    if (voiceMatch) {
        event.voice = parseInt(voiceMatch[1], 10);
        workingToken = workingToken.replace(/v\d+/, "");
    }

    const compactMatch = workingToken.match(
        /^(\d+|[OXox])f(\d+)s([whqes]\.?)$/i
    );
    if (compactMatch) {
        const rawFret = parseFretValue(compactMatch[1]);
        event.fret = rawFret !== null ? rawFret + capo : null;
        event.string = parseInt(compactMatch[2], 10);

        const durStr = compactMatch[3].toLowerCase();
        event.duration = durationMap[durStr] || 1.0;

        return event;
    }

    // 4. Extract Duration flag
    const durationMatch = workingToken.match(/@([whqes]\.?)/);
    if (durationMatch) {
        const durStr = durationMatch[1];
        // Map the string to the value; default to parseFloat if it's a raw number
        event.duration = durationMap[durStr] || parseFloat(durStr);
        workingToken = workingToken.split("@")[0];
    }

    // Case 1: Rest Item
    if (workingToken === "-") {
        return event;
    }

    // Case 2: Chord blocks [...]
    if (workingToken.startsWith("[")) {
        // Extract trailing duration if present right after the closing bracket (e.g., ]w)
        const closingBracketIndex = workingToken.lastIndexOf("]");
        const trailingDuration = workingToken
            .substring(closingBracketIndex + 1)
            .toLowerCase();

        if (trailingDuration && durationMap[trailingDuration]) {
            event.duration = durationMap[trailingDuration];
        }

        const chordContent = workingToken.slice(1, closingBracketIndex);
        // Split internal chord notes by spaces or pipes
        const elements = chordContent.split(/[\s|]+/).filter(Boolean);

        event.pitches = elements.map(el => {
            // Support compact syntax inside chords (e.g., 0f6s)
            const compactMatch = el.match(/^(\d+|[OXox])f(\d+)s?$/i);
            if (compactMatch) {
                return {
                    fret: parseFretValue(compactMatch[1]),
                    string: parseInt(compactMatch[2], 10)
                };
            }
            // Fallback to legacy syntax inside chords (e.g., 0:6)
            const parts = el.split(":");
            return {
                fret: parseFretValue(parts[0]),
                string: parseInt(parts[1], 10)
            };
        });
        return event;
    }

    // Case 3: Standard single note map
    if (workingToken.includes(":")) {
        const parts = workingToken.split(":");
        event.string = parseInt(parts[1], 10);
        const rawFret = parseFretValue(parts[0].trim());
        event.fret = rawFret !== null ? rawFret + capo : null;
        return event;
    }

    return event;
};

export const parseShorthandText = shorthandText => {
    const lines = shorthandText.split("\n");
    const scores = [];
    let currentScore = null;

    for (let line of lines) {
        line = line.trim();
        if (!line || line.startsWith("==") || line.startsWith("GUITALELE TAB"))
            continue;

        // Detect Score block instantiation
        if (line.startsWith("Score:")) {
            if (currentScore) {
                scores.push(currentScore);
            }
            currentScore = {
                id: "",
                title: line.replace("Score:", "").trim(),
                instrument: "",
                timeSignature: "",
                measures: [],
                capo: 0
            };
            continue;
        }

        if (currentScore) {
            if (line.startsWith("ID:")) {
                currentScore.id = line.replace("ID:", "").trim();
                continue;
            }
            if (line.startsWith("Instrument:")) {
                currentScore.instrument = line
                    .replace("Instrument:", "")
                    .trim();
                continue;
            }
            if (line.startsWith("Time Signature:")) {
                currentScore.timeSignature = line
                    .replace("Time Signature:", "")
                    .trim();
                continue;
            }
            if (line.startsWith("Description:")) {
                currentScore.description = line
                    .replace("Description:", "")
                    .trim();
                continue;
            }
            if (line.startsWith("Capo:")) {
                const capoValue = line.replace("Capo:", "").trim();
                currentScore.capo = parseInt(capoValue, 10) || 0;
                continue;
            }

            // Process structural measure text lines (Matches "Measure 1:" or "M 1:" or "M1:")
            // Or even a line not part of score definition, is a measure
            let measureNumber;
            let measureContent;

            const explicitMeasureMatch = line.match(
                /^(?:Measure|M)\s*(\d+):\s*(.*)$/i
            );

            if (explicitMeasureMatch) {
                measureNumber = parseInt(explicitMeasureMatch[1], 10);
                measureContent = explicitMeasureMatch[2];
            } else {
                // 1. A new line without metadata automatically denotes a new measure
                const lastMeasureNum =
                    currentScore.measures.length > 0
                        ? currentScore.measures[
                              currentScore.measures.length - 1
                          ].measureNumber
                        : 0;
                measureNumber = lastMeasureNum + 1;
                measureContent = line;
            }

            const rawTokens =
                measureContent.match(/\[[^\]]+\][^\s]*|[^\s|]+/g) || [];

            const notes = rawTokens.map(token =>
                parseToken(token, currentScore.capo)
            );

            currentScore.measures.push({
                measureNumber,
                notes
            });
        }
    }

    if (currentScore) {
        scores.push(currentScore);
    }

    if (scores.length === 0) {
        throw new Error(
            "No valid scores could be processed. Verify format headers."
        );
    }

    return scores;
};
