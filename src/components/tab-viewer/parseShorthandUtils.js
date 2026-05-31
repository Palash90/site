// Helper to parse fret characters preventing undefined/null errors
const parseFretValue = (fretStr) => {
    if (!fretStr) return null;
    const cleanFret = fretStr.trim().toUpperCase();
    if (cleanFret === 'O') return 0;
    if (cleanFret === 'X') return null;
    return parseInt(cleanFret, 10);
};

// Helper to parse individual note/rest/chord tokens cleanly
export const parseToken = (token) => {
    const event = { duration: 1.0 }; // Default fallback
    let workingToken = token.trim();

    // 1. Extract Description (d:...) from the end of the token safely
    const descIndex = workingToken.indexOf('d:');
    if (descIndex !== -1) {
        event.description = workingToken.substring(descIndex + 2);
        workingToken = workingToken.substring(0, descIndex);
    }

    // 2. Extract Tie flag
    if (workingToken.includes('t')) {
        event.tie = true;
        workingToken = workingToken.replace('t', '');
    }

    // 3. Extract Voice flag
    const voiceMatch = workingToken.match(/v(\d+)/);
    if (voiceMatch) {
        event.voice = parseInt(voiceMatch[1], 10);
        workingToken = workingToken.replace(/v\d+/, '');
    }

    // 4. Extract Duration flag
    const durationMatch = workingToken.match(/@([\d.]+)/);
    if (durationMatch) {
        event.duration = parseFloat(durationMatch[1]);
        workingToken = workingToken.split('@')[0];
    }

    // Case 1: Rest Item
    if (workingToken === '-') {
        return event;
    }

    // Case 2: Chord blocks [...]
    if (workingToken.startsWith('[') && workingToken.endsWith(']')) {
        const chordContent = workingToken.slice(1, -1);
        const elements = chordContent.split('|').filter(Boolean);
        
        event.pitches = elements.map(el => {
            const parts = el.split(':');
            return {
                string: parseInt(parts[1], 10),
                fret: parseFretValue(parts[0])
            };
        });
        return event;
    }

    // Case 3: Standard single note map
    if (workingToken.includes(':')) {
        const parts = workingToken.split(':');
        event.string = parseInt(parts[1], 10);
        event.fret = parseFretValue(parts[0]);
        return event;
    }

    return event;
};

export const parseShorthandText = (shorthandText) => {
    const lines = shorthandText.split('\n');
    const scores = [];
    let currentScore = null;

    for (let line of lines) {
        line = line.trim();
        if (!line || line.startsWith('==') || line.startsWith('GUITAR TAB')) continue;

        // Detect Score block instantiation 
        if (line.startsWith('Score:')) {
            if (currentScore) {
                scores.push(currentScore);
            }
            currentScore = {
                id: '',
                title: line.replace('Score:', '').trim(),
                instrument: '',
                timeSignature: '',
                measures: []
            };
            continue;
        }

        if (currentScore) {
            if (line.startsWith('ID:')) {
                currentScore.id = line.replace('ID:', '').trim();
                continue;
            }
            if (line.startsWith('Instrument:')) {
                currentScore.instrument = line.replace('Instrument:', '').trim();
                continue;
            }
            if (line.startsWith('Time Signature:')) {
                currentScore.timeSignature = line.replace('Time Signature:', '').trim();
                continue;
            }
            if (line.startsWith('Description:')) {
                currentScore.description = line.replace('Description:', '').trim();
                continue;
            }

            // Process structural measure text lines
            if (line.startsWith('Measure')) {
                const measureMatch = line.match(/^Measure\s+(\d+):\s*(.*)$/);
                if (measureMatch) {
                    const measureNumber = parseInt(measureMatch[1], 10);
                    const measureContent = measureMatch[2];

                    // Splitting tokens using a regex matching pipes outside brackets
                    const rawTokens = measureContent
                        .split(/\s+\|\s+/)
                        .map(t => t.trim())
                        .filter(Boolean);

                    const notes = rawTokens.map(token => parseToken(token));

                    currentScore.measures.push({
                        measureNumber,
                        notes
                    });
                }
            }
        }
    }

    // Always catch trailing score items at bottom of loop context
    if (currentScore) {
        scores.push(currentScore);
    }

    if (scores.length === 0) {
        throw new Error("No valid scores could be processed. Verify format headers.");
    }

    return scores;
};
