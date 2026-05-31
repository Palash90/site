// --- Static Configuration Matrix ---
export const TUNING = {
    1: { baseMidi: 69 }, // A4
    2: { baseMidi: 64 }, // E4
    3: { baseMidi: 60 }, // C4 (Middle C)
    4: { baseMidi: 55 }, // G3
    5: { baseMidi: 50 }, // D3
    6: { baseMidi: 45 }  // A2
};

// Global Node Manager: Clean audio summation channel with a safety compressor
const getMasterGain = (ctx) => {
    if (!ctx.masterGain) {
        // Global mix attenuation to prevent multi-voice accumulation clipping
        const masterGain = ctx.createGain();
        masterGain.gain.value = 0.35; 

        // Soft-knee safety limiter to cleanly catch multi-note summing peaks
        const limiter = ctx.createDynamicsCompressor();
        limiter.threshold.setValueAtTime(-1.0, ctx.currentTime);
        limiter.knee.setValueAtTime(3.0, ctx.currentTime);
        limiter.ratio.setValueAtTime(12.0, ctx.currentTime);
        limiter.attack.setValueAtTime(0.004, ctx.currentTime);
        limiter.release.setValueAtTime(0.05, ctx.currentTime);

        masterGain.connect(limiter);
        limiter.connect(ctx.destination);
        ctx.masterGain = masterGain; 
    }
    return ctx.masterGain;
};

/**
 * Plays a single note or a chain of continuous articulations with realistic nylon string modeling.
 * Re-engineered for crisp acoustic clarity, zero-pop note terminations, and smooth 6-string polyphony.
 */
export const playHumanizedGuitaleleNote = (ctx, midiOrChain, startTime, duration, velocity = 1.0) => {
    let segments = [];

    // 1. Parse Input for Backward Compatibility
    if (Array.isArray(midiOrChain)) {
        segments = midiOrChain;
    } else {
        segments = [{ type: 'pluck', midi: midiOrChain, duration: duration }];
    }

    // 2. Headroom & Polyphony Volume Balance Matrix
    // Dynamic scaling: If many notes or segments pass concurrently, scale down to provide headroom
    const polyphonyScale = Array.isArray(midiOrChain) && midiOrChain.length > 1 ? 0.5 : 0.85;
    const effectiveVelocity = velocity * polyphonyScale;

    // 3. Calculate Cumulative Physical Duration
    const totalDuration = segments.reduce((sum, seg) => sum + seg.duration, 0);
    const initialMidi = segments[0].midi;
    const initialFundamental = 440 * Math.pow(2, (initialMidi - 69) / 12);

    // --- DE-DIGITALIZATION: Waveshaping Distortion for Acoustic Saturation ---
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
    saturationNode.curve = makeDistortionCurve(10); // Reduced slightly from 15 to clean up dirty overtones
    saturationNode.oversample = '4x';

    // 4. Main Audio Routing Matrix & Nylon Acoustic Filters
    const mainGain = ctx.createGain();

    // Lowpass Damping Filter: Dynamic tone control
    const nylonDampFilter = ctx.createBiquadFilter();
    nylonDampFilter.type = 'lowpass';
    nylonDampFilter.frequency.setValueAtTime(Math.min(2000, initialFundamental * 3.5), startTime);
    nylonDampFilter.frequency.exponentialRampToValueAtTime(Math.min(400, initialFundamental * 1.0), startTime + Math.min(totalDuration, 1.0));
    nylonDampFilter.Q.value = 0.7; // Lowered to prevent filter-ringing artifacts

    // Body Resonance Filter: Adjusted to control the "runaway resonance" issue
    const bodyResonance = ctx.createBiquadFilter();
    bodyResonance.type = 'peaking';
    bodyResonance.frequency.value = 195; 
    bodyResonance.Q.value = 1.8;        // Widened Q from 3.5 to 1.8 to soften sharp, muddy frequencies
    bodyResonance.gain.value = 8.5;     // Reduced from 15.0 to eliminate booming/crackling build-up

    // Safe Output Routing Chain
    mainGain.connect(saturationNode);
    saturationNode.connect(nylonDampFilter);
    nylonDampFilter.connect(bodyResonance);
    bodyResonance.connect(getMasterGain(ctx));

    // 5. Nylon String Amplitude Envelope
    const attackTime = 0.006; 
    const totalDecayTime = Math.max(totalDuration * 0.95, 1.5);

    mainGain.gain.setValueAtTime(0, startTime);
    mainGain.gain.linearRampToValueAtTime(effectiveVelocity * 0.35, startTime + attackTime);
    mainGain.gain.exponentialRampToValueAtTime(effectiveVelocity * 0.12, startTime + 0.10);
    mainGain.gain.exponentialRampToValueAtTime(0.001, startTime + totalDecayTime - 0.02);

    // 6. Instantiate Core Voice Oscillators
    const stringOsc = ctx.createOscillator();
    stringOsc.type = 'triangle';

    const bassSubOsc = ctx.createOscillator();
    bassSubOsc.type = 'triangle';
    const bassGain = ctx.createGain();
    bassGain.gain.setValueAtTime(effectiveVelocity * 0.20, startTime);
    bassGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45); // Fast decaying fundamental "thump"
    bassSubOsc.connect(bassGain);

    const brightOsc = ctx.createOscillator();
    brightOsc.type = 'sawtooth';
    const brightGain = ctx.createGain();
    brightGain.gain.setValueAtTime(effectiveVelocity * 0.05, startTime);
    brightGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.06); 
    brightOsc.connect(brightGain);

    const overtoneOsc = ctx.createOscillator();
    overtoneOsc.type = 'sine';
    const overtoneGain = ctx.createGain();
    overtoneGain.gain.setValueAtTime(effectiveVelocity * 0.03, startTime);
    overtoneGain.gain.exponentialRampToValueAtTime(0.005, startTime + 0.25);
    overtoneOsc.connect(overtoneGain);

    const midResonance = ctx.createBiquadFilter();
    midResonance.type = 'bandpass';
    midResonance.Q.value = 1.0;

    // 7. Continuous Pitch Timeline Automation
    let timeCursor = startTime;
    let currentMidi = initialMidi;

    const detuneA = (Math.random() * 4) - 2; 
    const detuneB = (Math.random() * 6) - 3; 

    stringOsc.frequency.setValueAtTime(initialFundamental, timeCursor);
    bassSubOsc.frequency.setValueAtTime(initialFundamental, timeCursor);
    brightOsc.frequency.setValueAtTime(initialFundamental, timeCursor);
    overtoneOsc.frequency.setValueAtTime(initialFundamental * 2, timeCursor);
    midResonance.frequency.setValueAtTime(Math.max(600, initialFundamental * 1.7), timeCursor);

    stringOsc.detune.setValueAtTime(detuneA, timeCursor);
    bassSubOsc.detune.setValueAtTime(detuneB - 2, timeCursor); 

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

    // 8. Mechanical Pluck Transient Noise Buffer
    const noiseBuffer = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * 0.04)), ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) {
        noiseData[i] = (Math.random() * 2 - 1) * (1 - i / noiseData.length);
    }
    const pluckNoise = ctx.createBufferSource();
    pluckNoise.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 850; 
    noiseFilter.Q.value = 1.2;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(effectiveVelocity * 0.08, startTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.03);

    // Connect Layers
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

    // --- TIMELINE FIXED FADEOUT CALCULATION ---
    // A clean, deterministic 15ms fade window that avoids sudden math clipping.
    const fadeOutTime = 0.015; 
    const stopTime = startTime + totalDecayTime;

    // Anchor the current timeline value smoothly just prior to terminating
    mainGain.gain.setValueAtTime(0.001, stopTime - fadeOutTime);
    mainGain.gain.linearRampToValueAtTime(0, stopTime);

    // Turn off scheduling nodes safely on the zero-amplitude line
    stringOsc.stop(stopTime);
    bassSubOsc.stop(stopTime);
    brightOsc.stop(stopTime);
    overtoneOsc.stop(stopTime);
    pluckNoise.stop(stopTime);
};