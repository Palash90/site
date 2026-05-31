// --- Static Configuration Matrix ---
export const TUNING = {
    1: { baseMidi: 69 }, // A4
    2: { baseMidi: 64 }, // E4
    3: { baseMidi: 60 }, // C4 (Middle C)
    4: { baseMidi: 55 }, // G3
    5: { baseMidi: 50 }, // D3
    6: { baseMidi: 45 }  // A2
};

// Add this helper to prevent clipping globally
const getMasterGain = (ctx) => {
    if (!ctx.masterGain) {
        ctx.masterGain = ctx.createGain();
        ctx.masterGain.gain.value = 0.5; // Headroom to prevent clipping
        ctx.masterGain.connect(ctx.destination);
    }
    return ctx.masterGain;
};

// Add this helper or integrate directly into playHumanizedGuitaleleNote
const getDynamicVolume = (midiOrChain, velocity) => {
    // Determine the number of simultaneous triggers
    const triggerCount = Array.isArray(midiOrChain) ? 1 : 1; // You can pass 'activeNoteCount' as a param
    // Logarithmic scaling prevents the "doubling volume" effect
    const scale = 1 / Math.sqrt(Math.max(1, 3)); // Assume 3 notes are always possible
    return velocity * scale;
};

/**
 * Plays a single note or a chain of continuous articulations with realistic nylon string modeling.
 * Enhanced to eliminate 1980s digital synthesis artifacts and add warm body bass response.
 */
export const playHumanizedGuitaleleNote = (ctx, midiOrChain, startTime, duration, velocity = 1.0) => {
    let segments = [];

    // 1. Parse Input for Backward Compatibility
    if (Array.isArray(midiOrChain)) {
        segments = midiOrChain;
    } else {
        segments = [{ type: 'pluck', midi: midiOrChain, duration: duration }];
    }

    // 2. Calculate Cumulative Physical Duration
    const totalDuration = segments.reduce((sum, seg) => sum + seg.duration, 0);
    const initialMidi = segments[0].midi;
    const initialFundamental = 440 * Math.pow(2, (initialMidi - 69) / 12);

    // --- DE-DIGITALIZATION: Waveshaping Distortion for Acoustic Saturation ---
    // This removes the clean mathematical 1980s look of the waves and gives them organic roundness
    const makeDistortionCurve = (amount) => {
        const k = typeof amount === 'number' ? amount : 50;
        const n_samples = 44100;
        const curve = new Float32Array(n_samples);
        const deg = Math.PI / 180;
        for (let i = 0; i < n_samples; ++i) {
            const x = (i * 2) / n_samples - 1;
            curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
        }
        return curve;
    };
    const saturationNode = ctx.createWaveShaper();
    saturationNode.curve = makeDistortionCurve(15);
    saturationNode.oversample = '4x';

    // 3. Main Audio Routing Matrix & Nylon Acoustic Filters
    const mainGain = ctx.createGain();

    // Lowpass Damping Filter
    const nylonDampFilter = ctx.createBiquadFilter();
    nylonDampFilter.type = 'lowpass';
    nylonDampFilter.frequency.setValueAtTime(Math.min(2200, initialFundamental * 4), startTime);
    nylonDampFilter.frequency.exponentialRampToValueAtTime(Math.min(450, initialFundamental * 1.1), startTime + Math.min(totalDuration, 1.2));
    nylonDampFilter.Q.value = 0.8;

    // Body Resonance Filter: Adjusted lower to maximize the wood "box" bass resonance
    const bodyResonance = ctx.createBiquadFilter();
    bodyResonance.type = 'peaking';
    bodyResonance.frequency.value = 195; // Dropped closer to lower string body coupling frequencies
    bodyResonance.Q.value = 3.5;
    bodyResonance.gain.value = 15;     // Enhanced bass warmth boost

    // Master output routing chain
    mainGain.connect(saturationNode);
    saturationNode.connect(nylonDampFilter);
    nylonDampFilter.connect(bodyResonance);
    bodyResonance.connect(getMasterGain(ctx));

    // 4. Nylon String Amplitude Envelope (Soft initial attack, fast decay, long warm tail)
    const attackTime = 0.008; // Slightly slower attack to soften the electronic transient edge
    const totalDecayTime = Math.max(totalDuration * 0.95, 1.8);

    mainGain.gain.setValueAtTime(0, startTime);
    mainGain.gain.linearRampToValueAtTime(velocity * 0.40, startTime + attackTime);
    mainGain.gain.exponentialRampToValueAtTime(velocity * 0.14, startTime + 0.12);
    mainGain.gain.exponentialRampToValueAtTime(0.001, startTime + totalDecayTime);

    // 5. Instantiate Core Voice Oscillators (With Phase Micro-Detuning to break digital uniformity)
    const stringOsc = ctx.createOscillator();
    stringOsc.type = 'triangle';

    // Secondary foundational oscillator to build a thicker bass response
    const bassSubOsc = ctx.createOscillator();
    bassSubOsc.type = 'triangle';
    const bassGain = ctx.createGain();
    bassGain.gain.setValueAtTime(velocity * 0.25, startTime);
    bassGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6); // Fast decaying sub-body energy
    bassSubOsc.connect(bassGain);

    const brightOsc = ctx.createOscillator();
    brightOsc.type = 'sawtooth';
    const brightGain = ctx.createGain();
    brightGain.gain.setValueAtTime(velocity * 0.07, startTime);
    brightGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08); // Blends out faster to kill synth buzz
    brightOsc.connect(brightGain);

    const overtoneOsc = ctx.createOscillator();
    overtoneOsc.type = 'sine';
    const overtoneGain = ctx.createGain();
    overtoneGain.gain.setValueAtTime(0.04, startTime);
    overtoneGain.gain.exponentialRampToValueAtTime(0.005, startTime + 0.3);
    overtoneOsc.connect(overtoneGain);

    const midResonance = ctx.createBiquadFilter();
    midResonance.type = 'bandpass';
    midResonance.Q.value = 1.2;

    // 6. Continuous Pitch Timeline Automation (Safe Ramp Targets with Acoustic Variance)
    let timeCursor = startTime;
    let currentMidi = initialMidi;

    // Introduce humanized micro-detuning cents adjustments per string layer
    const detuneA = (Math.random() * 4) - 2; // -2 to +2 cents
    const detuneB = (Math.random() * 6) - 3; // -3 to +3 cents

    stringOsc.frequency.setValueAtTime(initialFundamental, timeCursor);
    bassSubOsc.frequency.setValueAtTime(initialFundamental, timeCursor);
    brightOsc.frequency.setValueAtTime(initialFundamental, timeCursor);
    overtoneOsc.frequency.setValueAtTime(initialFundamental * 2, timeCursor);
    midResonance.frequency.setValueAtTime(Math.max(600, initialFundamental * 1.7), timeCursor);

    stringOsc.detune.setValueAtTime(detuneA, timeCursor);
    bassSubOsc.detune.setValueAtTime(detuneB - 3, timeCursor); // Slightly spread bass base downwards

    for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        const segmentStartTime = timeCursor;
        const segmentEndTime = timeCursor + seg.duration;
        const targetFund = 440 * Math.pow(2, (seg.midi - 69) / 12);

        if (seg.type === 'slide') {
            const startFund = 440 * Math.pow(2, (currentMidi - 69) / 12);

            stringOsc.frequency.setValueAtTime(startFund, segmentStartTime);
            bassSubOsc.frequency.setValueAtTime(startFund, segmentStartTime);
            brightOsc.frequency.setValueAtTime(startFund, segmentStartTime);
            overtoneOsc.frequency.setValueAtTime(startFund * 2, segmentStartTime);
            midResonance.frequency.setValueAtTime(Math.max(600, startFund * 1.7), segmentStartTime);

            stringOsc.frequency.linearRampToValueAtTime(targetFund, segmentEndTime);
            bassSubOsc.frequency.linearRampToValueAtTime(targetFund, segmentEndTime);
            brightOsc.frequency.linearRampToValueAtTime(targetFund, segmentEndTime);
            overtoneOsc.frequency.linearRampToValueAtTime(targetFund * 2, segmentEndTime);
            midResonance.frequency.linearRampToValueAtTime(Math.max(600, targetFund * 1.7), segmentEndTime);

            currentMidi = seg.midi;
        } else if (seg.type === 'hammer' || seg.type === 'pull') {
            stringOsc.frequency.setValueAtTime(targetFund, segmentStartTime);
            bassSubOsc.frequency.setValueAtTime(targetFund, segmentStartTime);
            brightOsc.frequency.setValueAtTime(targetFund, segmentStartTime);
            overtoneOsc.frequency.setValueAtTime(targetFund * 2, segmentStartTime);
            midResonance.frequency.setValueAtTime(Math.max(600, targetFund * 1.7), segmentStartTime);

            currentMidi = seg.midi;

            stringOsc.frequency.setValueAtTime(targetFund, segmentEndTime);
            bassSubOsc.frequency.setValueAtTime(targetFund, segmentEndTime);
            brightOsc.frequency.setValueAtTime(targetFund, segmentEndTime);
            overtoneOsc.frequency.setValueAtTime(targetFund * 2, segmentEndTime);
        } else {
            const currentFund = 440 * Math.pow(2, (currentMidi - 69) / 12);
            stringOsc.frequency.setValueAtTime(currentFund, segmentEndTime);
            bassSubOsc.frequency.setValueAtTime(currentFund, segmentEndTime);
            brightOsc.frequency.setValueAtTime(currentFund, segmentEndTime);
            overtoneOsc.frequency.setValueAtTime(currentFund * 2, segmentEndTime);
        }

        timeCursor = segmentEndTime;
    }

    // 7. Mechanical Pluck Transient (Deep Friction Noise Variant)
    // We add a low frequency noise profile to emulate the thumb flesh contact on the heavy lower strings
    const noiseBuffer = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * 0.045)), ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) {
        noiseData[i] = (Math.random() * 2 - 1) * (1 - i / noiseData.length);
    }
    const pluckNoise = ctx.createBufferSource();
    pluckNoise.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 850; // Dropped to reduce glassiness and capture standard nail warmth
    noiseFilter.Q.value = 1.2;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(velocity * 0.09, startTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.035);

    // 8. Connect Module Nodes
    stringOsc.connect(mainGain);
    bassGain.connect(mainGain);
    brightGain.connect(mainGain);

    overtoneOsc.connect(overtoneGain);
    overtoneGain.connect(midResonance);
    midResonance.connect(mainGain);

    pluckNoise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(mainGain);

    // 9. Playback Execution
    stringOsc.start(startTime);
    bassSubOsc.start(startTime);
    brightOsc.start(startTime);
    overtoneOsc.start(startTime);
    pluckNoise.start(startTime);

    // 1. Scale velocity for chords to prevent clipping
    const polyphonyScale = Array.isArray(midiOrChain) && midiOrChain.length > 1 ? 0.6 : 1.0;
    const effectiveVelocity = velocity * polyphonyScale;

    // 2. Playback Execution with a proper Fade-Out
    const fadeOutTime = 0.0000001; // 10ms is the "sweet spot" for click-free stops
    const stopTime = startTime + totalDecayTime;

    // Ensure we ramp to zero *at* the stopTime
    // First, anchor the current gain at the start of the fade-out
    mainGain.gain.setValueAtTime(mainGain.gain.value, stopTime - fadeOutTime);
    // Then ramp to zero over the fadeOutTime duration
    mainGain.gain.linearRampToValueAtTime(0, stopTime);

    // 3. Stop the oscillators exactly at the stopTime
    stringOsc.stop(stopTime);
    bassSubOsc.stop(stopTime);
    brightOsc.stop(stopTime);
    overtoneOsc.stop(stopTime);
    pluckNoise.stop(stopTime);
};