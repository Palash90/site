// Parser to convert the dummy_score.js to a Node-friendly format
const fs = require('fs');
const path = require('path');

/**
 * Encodes a single note into shorthand format
 */
function encodeNote(note) {
  // Handle rest
  if (!note.hasOwnProperty('fret') && !note.hasOwnProperty('string') && !note.hasOwnProperty('pitches')) {
    let shorthand = `-@${note.duration}`;
    if (note.voice) shorthand += `v${note.voice}`;
    return shorthand;
  }

  // Handle pitches array (chord)
  if (note.pitches && Array.isArray(note.pitches)) {
    const pitchesShorthand = note.pitches.map(pitch => {
      if (pitch.fret === null) return `X:${pitch.string}`;
      if (pitch.fret === 0) return `O:${pitch.string}`;
      return `${pitch.fret}:${pitch.string}`;
    }).join('|');
    
    let shorthand = `[${pitchesShorthand}]@${note.duration}`;
    if (note.voice) shorthand += `v${note.voice}`;
    if (note.tie) shorthand += 't';
    return shorthand;
  }

  // Handle single note
  let fretPart = '';
  if (note.fret === null) {
    fretPart = `X:${note.string}`;
  } else if (note.fret === 0) {
    fretPart = `O:${note.string}`;
  } else {
    fretPart = `${note.fret}:${note.string}`;
  }

  let shorthand = `${fretPart}@${note.duration}`;
  if (note.voice) shorthand += `v${note.voice}`;
  if (note.tie) shorthand += 't';
  if (note.description) shorthand += `d:${note.description}`;

  return shorthand;
}

/**
 * Encodes an entire score into shorthand format
 */
function encodeScore(score) {
  let output = '';
  output += `\n${'='.repeat(80)}\n`;
  output += `Score: ${score.title || score.id}\n`;
  output += `ID: ${score.id}\n`;
  output += `Instrument: ${score.instrument || 'N/A'}\n`;
  output += `Time Signature: ${score.timeSignature || 'N/A'}\n`;
  if (score.description) output += `Description: ${score.description}\n`;
  output += `${'='.repeat(80)}\n\n`;

  score.measures.forEach(measure => {
    output += `Measure ${measure.measureNumber}: `;
    const notesShorthand = measure.notes.map(encodeNote).join(' | ');
    output += notesShorthand;
    output += '\n';
  });

  return output;
}

// Read dummy_score.js
const scoreFilePath = path.join(__dirname, 'src/components/tab-viewer/dummy_score.js');
let fileContent = fs.readFileSync(scoreFilePath, 'utf-8');

// Convert ES6 exports to CommonJS exports
fileContent = fileContent.replace(/export const (\w+) = /g, 'const $1 = ');
fileContent += '\nmodule.exports = { two_voice_test, dummyScore, dummyScore24, maryHadALittleLamb, twinkleTwinkleLittleStar, dummyScore34, dummyScore68, dummyScore22, many_ties_score, allScores };';

// Write to a temporary CommonJS file and require it
const tempPath = path.join(__dirname, 'src/components/tab-viewer/.scoreTemp.js');
fs.writeFileSync(tempPath, fileContent);

try {
  // Clear require cache and load the temp file
  delete require.cache[require.resolve(tempPath)];
  const scores = require(tempPath);

  // Filter to get actual score objects
  const scoreObjects = Object.values(scores).filter(
    obj => obj && typeof obj === 'object' && obj.id && obj.measures
  );

  if (scoreObjects.length === 0) {
    console.error('No valid scores found');
    fs.unlinkSync(tempPath);
    process.exit(1);
  }

  // Generate output
  let outputContent = '';
  outputContent += `GUITAR TAB SCORES - SHORTHAND ENCODING\n`;
  outputContent += `Generated: ${new Date().toISOString()}\n`;
  outputContent += `Format: F:S@D[v#][t][d:description]\n`;
  outputContent += `  F = Fret (0-24, O=open, X=muted)\n`;
  outputContent += `  S = String (1-6)\n`;
  outputContent += `  D = Duration (0.25, 0.5, 1.0, 2.0, 4.0)\n`;
  outputContent += `  v# = Voice (optional)\n`;
  outputContent += `  t = Tie (optional)\n`;
  outputContent += `  d:text = Description (optional)\n`;
  outputContent += `  - = Rest\n`;
  outputContent += `  | = Note separator\n`;
  outputContent += `  [F:S|F:S...] = Chord/Pitches\n`;
  outputContent += `${'='.repeat(80)}\n`;

  // Encode all scores
  scoreObjects.forEach(score => {
    outputContent += encodeScore(score);
  });

  // Write to file
  const outputPath = path.join(__dirname, 'src/components/tab-viewer/scores_shorthand.txt');
  fs.writeFileSync(outputPath, outputContent, 'utf-8');
  console.log(`✓ Encoded ${scoreObjects.length} scores to: scores_shorthand.txt`);
  console.log(`✓ Total characters: ${outputContent.length}`);
  
  // Clean up temp file
  fs.unlinkSync(tempPath);
} catch (error) {
  console.error('Error:', error.message);
  if (fs.existsSync(tempPath)) {
    fs.unlinkSync(tempPath);
  }
  process.exit(1);
}
