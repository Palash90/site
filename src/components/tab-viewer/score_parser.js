const ScoreParser = {
  /**
   * Encodes a JSON score object into a compressed shorthand string
   */
  encode(score) {
    const meta = [
      score.id,
      score.title,
      score.instrument,
      score.description,
      score.timeSignature
    ].join('|');

    const encodedNotes = score.notes.map(note => {
      // Handle rest notes
      if (note.fret === undefined && note.string === undefined) {
        return `rd${note.duration}`;
      }

      let token = `${note.fret}s${note.string}d${note.duration}`;
      
      if (note.voice !== undefined) token += `v${note.voice}`;
      if (note.tie) token += 't';
      
      return token;
    }).join(' ');

    return `${meta}|${encodedNotes}`;
  },

  /**
   * Decodes a shorthand string back into the original JSON object structure
   */
  decode(shorthand) {
    const parts = shorthand.split('|');
    if (parts.length < 6) {
      throw new Error("Invalid shorthand format string.");
    }

    const [id, title, instrument, description, timeSignature] = parts;
    // Reconstruction of the note string matrix
    const notesString = parts.slice(5).join('|'); 
    
    const notes = notesString.trim().split(/\s+/).map(token => {
      // Check if it's a rest note
      if (token.startsWith('r')) {
        const duration = parseFloat(token.substring(2));
        return { duration };
      }

      // Regex matching: fret 's' string 'd' duration ['v' voice] ['t']
      const regex = /^(\d+)s(\d+)d([\d.]+)(?:v(\d+))?(t)?$/;
      const match = token.match(regex);

      if (!match) {
        throw new Error(`Malformed note token: "${token}"`);
      }

      const [_, fret, string, duration, voice, tie] = match;
      const noteObj = {
        fret: parseInt(fret, 10),
        string: parseInt(string, 10),
        duration: parseFloat(duration)
      };

      if (voice !== undefined) {
        noteObj.voice = parseInt(voice, 10);
      }
      if (tie !== undefined) {
        noteObj.tie = true;
      }

      return noteObj;
    });

    return { id, title, instrument, description, timeSignature, notes };
  }
};