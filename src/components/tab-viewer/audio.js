// --- Static Configuration Matrix ---
export const TUNING = {
    1: { baseMidi: 69 }, // A4
    2: { baseMidi: 64 }, // E4
    3: { baseMidi: 60 }, // C4 (Middle C)
    4: { baseMidi: 55 }, // G3
    5: { baseMidi: 50 }, // D3
    6: { baseMidi: 45 }  // A2
};

/**
 * Plays a single note or a chain of continuous articulations (Ties, Slides, Legato).
 * * @param {AudioContext} ctx - Web Audio API Context
 * @param {number|Array} midiOrChain - Pass a MIDI number for a normal note, or an array of segments for continuous play.
 * Example chain: [
 * { type: 'pluck', midi: 50, duration: 1.0 },
 * { type: 'tie', midi: 50, duration: 1.0 },
 * { type: 'slide', midi: 54, duration: 0.5 },
 * { type: 'hammer', midi: 55, duration: 0.5 }
 * ]
 * @param {number} startTime - Absolute Web Audio context start time
 * @param {number} duration - Standard note duration (fallback if midiOrChain is a number)
 * @param {number} velocity - Velocity / Volume multiplier (0.0 to 1.0)
 */
export const playHumanizedGuitaleleNote = (ctx, midiOrChain, startTime, duration, velocity = 1.0) => {
    let segments = [];

    // 1. Parse Input for Backward Compatibility
    if (Array.isArray(midiOrChain)) {
        segments = midiOrChain;
    } else {
        // Normal single note converted to a single pluck segment
        segments = [{ type: 'pluck', midi: midiOrChain, duration: duration }];
    }

    // 2. Calculate Cumulative Physical Duration
    const totalDuration = segments.reduce((sum, seg) => sum + seg.duration, 0);
    const initialMidi = segments[0].midi;
    const initialFundamental = 440 * Math.pow(2, (initialMidi - 69) / 12);

    // 3. Main Audio Routing Matrix
    const mainGain = ctx.createGain();
    const bodyFilter = ctx.createBiquadFilter();
    bodyFilter.type = 'lowpass';
    bodyFilter.frequency.setValueAtTime(Math.min(2800, initialFundamental * 6), startTime);
    bodyFilter.Q.value = 0.7;
    bodyFilter.connect(ctx.destination);
    mainGain.connect(bodyFilter);

    // 4. Combined Amplitude Envelope (The string decays naturally across all segments)
    const attackTime = 0.004;
    const totalDecayTime = Math.max(totalDuration * 0.85, 1.4);

    mainGain.gain.setValueAtTime(0, startTime);
    mainGain.gain.linearRampToValueAtTime(velocity * 0.5, startTime + attackTime);
    mainGain.gain.exponentialRampToValueAtTime(velocity * 0.18, startTime + 0.08);
    mainGain.gain.exponentialRampToValueAtTime(0.001, startTime + totalDecayTime);

    // 5. Instantiate Core Voice Oscillators
    const stringOsc = ctx.createOscillator();
    stringOsc.type = 'triangle';

    const overtoneOsc = ctx.createOscillator();
    overtoneOsc.type = 'sine';
    const overtoneGain = ctx.createGain();
    overtoneGain.gain.value = 0.08;
    overtoneOsc.connect(overtoneGain);

    const midResonance = ctx.createBiquadFilter();
    midResonance.type = 'bandpass';

    // 6. Continuous Pitch Timeline Automation
    let timeCursor = startTime;
    let currentMidi = initialMidi;

    // Initialize core frequencies at starting point
    stringOsc.frequency.setValueAtTime(initialFundamental, timeCursor);
    overtoneOsc.frequency.setValueAtTime(initialFundamental * 2, timeCursor);
    midResonance.frequency.setValueAtTime(Math.max(650, initialFundamental * 1.8), timeCursor);

    for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        const nextTime = timeCursor + seg.duration;

        if (seg.type === 'slide') {
            // SLIDE UP / SLIDE DOWN: Linearly ramp frequency to destination over segment duration
            const targetFund = 440 * Math.pow(2, (seg.midi - 69) / 12);
            stringOsc.frequency.linearRampToValueAtTime(targetFund, nextTime);
            overtoneOsc.frequency.linearRampToValueAtTime(targetFund * 2, nextTime);
            midResonance.frequency.linearRampToValueAtTime(Math.max(650, targetFund * 1.8), nextTime);
            currentMidi = seg.midi;
        } else if (seg.type === 'hammer' || seg.type === 'pull') {
            // HAMMER ON / PULL OFF: Instantly snap pitch at segment boundary without a new pluck
            const targetFund = 440 * Math.pow(2, (seg.midi - 69) / 12);
            stringOsc.frequency.setValueAtTime(targetFund, timeCursor);
            overtoneOsc.frequency.setValueAtTime(targetFund * 2, timeCursor);
            midResonance.frequency.setValueAtTime(Math.max(650, targetFund * 1.8), timeCursor);
            currentMidi = seg.midi;

            // Hold frequency value steady to the end of the segment
            stringOsc.frequency.setValueAtTime(targetFund, nextTime);
            overtoneOsc.frequency.setValueAtTime(targetFund * 2, nextTime);
        } else {
            // TIE / PLUCK: Maintain current string length pitch steady through this duration block
            const currentFund = 440 * Math.pow(2, (currentMidi - 69) / 12);
            stringOsc.frequency.setValueAtTime(currentFund, nextTime);
            overtoneOsc.frequency.setValueAtTime(currentFund * 2, nextTime);
        }

        timeCursor = nextTime;
    }

    // 7. Mechanical Pluck Transient (Fires ONLY once at the initial timestamp)
    const pluckOsc = ctx.createOscillator();
    pluckOsc.type = 'triangle';
    pluckOsc.frequency.setValueAtTime(initialFundamental * 1.7, startTime);
    pluckOsc.frequency.exponentialRampToValueAtTime(initialFundamental * 0.98, startTime + 0.025);

    const pluckGain = ctx.createGain();
    pluckGain.gain.setValueAtTime(0, startTime);
    pluckGain.gain.linearRampToValueAtTime(velocity * 0.16, startTime + 0.003);
    pluckGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.045);

    const noiseBuffer = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * 0.025)), ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) {
        noiseData[i] = (Math.random() * 2 - 1) * (1 - i / noiseData.length);
    }
    const pluckNoise = ctx.createBufferSource();
    pluckNoise.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 900;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(velocity * 0.045, startTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.028);

    // 8. Connect Module Nodes
    pluckOsc.connect(pluckGain);
    pluckGain.connect(mainGain);
    stringOsc.connect(mainGain);
    overtoneGain.connect(midResonance);
    midResonance.connect(mainGain);
    pluckNoise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(mainGain);

    // 9. Playback Execution
    stringOsc.start(startTime);
    overtoneOsc.start(startTime);
    pluckOsc.start(startTime);
    pluckNoise.start(startTime);

    // Clean up nodes together at the absolute tail of the expression
    stringOsc.stop(startTime + totalDecayTime);
    overtoneOsc.stop(startTime + totalDecayTime);
    pluckOsc.stop(startTime + totalDecayTime);
    pluckNoise.stop(startTime + 0.03);
};