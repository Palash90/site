const parseFretValue = fretStr => {
    if (!fretStr) return null;
    const cleanFret = fretStr.trim().toUpperCase();
    if (cleanFret === "O") return 0;
    if (cleanFret === "X") return null;
    return parseInt(cleanFret, 10);
};

const durationMap = {
    s: 0.25,
    e: 0.5,
    "e.": 0.75,
    q: 1.0,
    "q.": 1.5,
    h: 2.0,
    "h.": 3.0,
    w: 4.0,
    "w.": 6.0
};

const getExpectedBeats = timeSignature => {
    if (!timeSignature) return 4.0;
    const parts = timeSignature.split("/");
    const num = parseInt(parts[0], 10);
    const den = parseInt(parts[1], 10);
    if (isNaN(num) || isNaN(den)) return 4.0;
    return num * (4 / den);
};

export const parseToken = (token, capo = 0) => {
    const event = { duration: 1.0 };
    let workingToken = token.trim();

    const descIndex = workingToken.indexOf("d:");
    if (descIndex !== -1) {
        event.description = workingToken.substring(descIndex + 2);
        workingToken = workingToken.substring(0, descIndex);
    }

    if (workingToken.includes("t")) {
        event.tie = true;
        workingToken = workingToken.replace("t", "");
    }

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

    const durationMatch = workingToken.match(/@([whqes]\.?)/);
    if (durationMatch) {
        const durStr = durationMatch[1];
        event.duration = durationMap[durStr] || parseFloat(durStr);
        workingToken = workingToken.split("@")[0];
    }

    if (workingToken.startsWith("-")) {
        const restDurMatch = workingToken.match(/^-([whqes]\.?)/i);
        if (restDurMatch) {
            const durStr = restDurMatch[1].toLowerCase();
            event.duration = durationMap[durStr] || event.duration;
        }
        event.isRest = true;
        return event;
    }

    if (workingToken.startsWith("[")) {
        const closingBracketIndex = workingToken.lastIndexOf("]");
        const trailingDuration = workingToken
            .substring(closingBracketIndex + 1)
            .toLowerCase();

        if (trailingDuration && durationMap[trailingDuration]) {
            event.duration = durationMap[trailingDuration];
        }

        const chordContent = workingToken.slice(1, closingBracketIndex);
        const elements = chordContent.split(/[\s|]+/).filter(Boolean);

        event.pitches = elements.map(el => {
            const compactMatch = el.match(/^(\d+|[OXox])f(\d+)s?$/i);
            if (compactMatch) {
                return {
                    fret: parseFretValue(compactMatch[1]),
                    string: parseInt(compactMatch[2], 10)
                };
            }
            const parts = el.split(":");
            return {
                fret: parseFretValue(parts[0]),
                string: parseInt(parts[1], 10)
            };
        });
        return event;
    }

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
    const errors = [];
    let currentScore = null;

    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
        const line = lines[lineIdx].trim();
        if (!line || line.startsWith("==") || line.startsWith("GUITALELE TAB"))
            continue;

        if (line.startsWith("Score:")) {
            if (currentScore) {
                scores.push(currentScore);
            }
            currentScore = {
                id: "",
                title: line.replace("Score:", "").trim(),
                instrument: "",
                timeSignature: "4/4",
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

            let measureNumber;
            let measureContent;

            const explicitMeasureMatch = line.match(
                /^(?:Measure|M)\s*(\d+):\s*(.*)$/i
            );

            if (explicitMeasureMatch) {
                measureNumber = parseInt(explicitMeasureMatch[1], 10);
                measureContent = explicitMeasureMatch[2];
            } else {
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
            const notes = [];
            let totalBeats = 0;

            for (const token of rawTokens) {
                if (token.startsWith("[") && !token.includes("]")) {
                    errors.push(
                        `Measure ${measureNumber}: missing closing bracket in "${token}".`
                    );
                }

                const note = parseToken(token, currentScore.capo);

                const isRecognized =
                    note.fret !== undefined ||
                    note.isRest ||
                    note.pitches;

                if (!isRecognized) {
                    errors.push(
                        `Measure ${measureNumber}: unrecognized token "${token}".`
                    );
                }

                if (
                    note.string !== undefined &&
                    (isNaN(note.string) || note.string < 1 || note.string > 6)
                ) {
                    errors.push(
                        `Measure ${measureNumber}: string ${note.string} in "${token}" is out of range (1-6).`
                    );
                }

                if (note.pitches) {
                    for (const p of note.pitches) {
                        if (
                            p.string !== undefined &&
                            (isNaN(p.string) || p.string < 1 || p.string > 6)
                        ) {
                            errors.push(
                                `Measure ${measureNumber}: string ${p.string} in chord "${token}" is out of range (1-6).`
                            );
                        }
                    }
                }

                notes.push(note);
                totalBeats += note.duration;
            }

            if (notes.length > 0) {
                const expectedBeats = getExpectedBeats(
                    currentScore.timeSignature
                );
                if (Math.abs(totalBeats - expectedBeats) > 0.01) {
                    errors.push(
                        `Measure ${measureNumber}: expected ${expectedBeats} beat(s) but got ${totalBeats}. Check your durations.`
                    );
                }
            }

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

    return { scores, errors };
};
