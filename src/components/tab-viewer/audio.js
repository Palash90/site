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
        // Global mix gain with proper headroom for multi-note polyphony
        const masterGain = ctx.createGain();
        masterGain.gain.value = 0.65;

        // Intelligent limiter: threshold higher to avoid over-compression, faster attack for safety
        const limiter = ctx.createDynamicsCompressor();
        limiter.threshold.setValueAtTime(-8.0, ctx.currentTime);  // -8dB allows more headroom before limiting
        limiter.knee.setValueAtTime(6.0, ctx.currentTime);        // Increased knee for smoother onset
        limiter.ratio.setValueAtTime(8.0, ctx.currentTime);       // Reduced ratio for gentler compression
        limiter.attack.setValueAtTime(0.003, ctx.currentTime);    // Faster attack to catch peaks
        limiter.release.setValueAtTime(0.15, ctx.currentTime);    // Longer release for musical decay

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
    if (Array.isArray(midiOrChain)) {
        segments = midiOrChain;
    } else {
        segments = [{ type: 'pluck', midi: midiOrChain, duration: duration }];
    }

    const polyphonyScale = Array.isArray(midiOrChain) && midiOrChain.length > 1 ? 0.65 : 1.0;
    const effectiveVelocity = velocity * polyphonyScale;
    const totalDuration = segments.reduce((sum, seg) => sum + (seg.duration || 0), 0);
    const firstPlayable = segments.find(s => typeof s.midi === 'number');

    // High efficiency percussive noise for dead notes (No buffers allocated)
    const playMutedPercussion = (time, dur = 0.05, vel = 0.5) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, time);

        g.gain.setValueAtTime(vel * 0.15, time);
        g.gain.exponentialRampToValueAtTime(0.001, time + dur);

        osc.connect(g);
        g.connect(getMasterGain(ctx));
        osc.start(time);
        osc.stop(time + dur);
    };

    if (!firstPlayable) {
        let cursor = startTime;
        for (let i = 0; i < segments.length; i++) {
            const seg = segments[i];
            const segDur = seg.duration || 0.25;
            if (seg.type === 'mute') playMutedPercussion(cursor, Math.min(0.06, segDur));
            cursor += segDur;
        }
        return;
    }

    if (segments.length > 0 && segments.every(s => s.type === 'mute')) return;

    const initialMidi = firstPlayable.midi;
    const initialFundamental = 440 * Math.pow(2, (initialMidi - 69) / 12);

    // Main Audio Nodes (Consolidated allocation footprint)
    const mainGain = ctx.createGain();
    const nylonDampFilter = ctx.createBiquadFilter();
    nylonDampFilter.type = 'lowpass';
    nylonDampFilter.frequency.setValueAtTime(Math.min(1800, initialFundamental * 3.0), startTime);
    nylonDampFilter.frequency.exponentialRampToValueAtTime(Math.min(350, initialFundamental * 1.0), startTime + Math.min(totalDuration, 0.8));

    const bodyResonance = ctx.createBiquadFilter();
    bodyResonance.type = 'peaking';
    bodyResonance.frequency.value = 195;
    bodyResonance.Q.value = 1.5;
    bodyResonance.gain.value = 6.0;

    mainGain.connect(nylonDampFilter);
    nylonDampFilter.connect(bodyResonance);
    bodyResonance.connect(getMasterGain(ctx));

    // Consolidated Nylon Amplitude Envelope
    const attackTime = 0.005;
    const totalDecayTime = Math.max(totalDuration * 0.95, 1.2);

    mainGain.gain.setValueAtTime(0, startTime);
    mainGain.gain.linearRampToValueAtTime(effectiveVelocity * 0.65, startTime + attackTime);
    mainGain.gain.exponentialRampToValueAtTime(effectiveVelocity * 0.20, startTime + 0.08);
    mainGain.gain.exponentialRampToValueAtTime(0.001, startTime + totalDecayTime - 0.02);

    // Re-engineered Core Oscillator Chain (Drops multi-oscillator allocation stress)
    const stringOsc = ctx.createOscillator();
    stringOsc.type = 'triangle';

    const detune = (Math.random() * 4) - 2;
    stringOsc.frequency.setValueAtTime(initialFundamental, startTime);
    stringOsc.detune.setValueAtTime(detune, startTime);

    // Organic transient emulation via brief frequency modulation sweep instead of dedicated audio buffer sources
    stringOsc.frequency.setValueAtTime(initialFundamental * 1.03, startTime);
    stringOsc.frequency.exponentialRampToValueAtTime(initialFundamental, startTime + 0.02);

    stringOsc.connect(mainGain);

    // Continuous Pitch Timeline Automation
    let timeCursor = startTime;
    let currentMidi = initialMidi;

    for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        const segmentStartTime = timeCursor;
        const segmentEndTime = timeCursor + seg.duration;
        const hasMidi = typeof seg.midi === 'number';

        if (seg.type === 'mute') {
            timeCursor = segmentEndTime;
            continue;
        }

        if (seg.type === 'slide') {
            const startFund = 440 * Math.pow(2, (currentMidi - 69) / 12);
            const targetFund = hasMidi ? 440 * Math.pow(2, (seg.midi - 69) / 12) : startFund;

            stringOsc.frequency.setValueAtTime(startFund, segmentStartTime);
            stringOsc.frequency.linearRampToValueAtTime(targetFund, segmentEndTime);
            currentMidi = seg.midi;
        } else if (seg.type === 'hammer' || seg.type === 'pull') {
            if (hasMidi) {
                const targetFund = 440 * Math.pow(2, (seg.midi - 69) / 12);
                stringOsc.frequency.setValueAtTime(targetFund, segmentStartTime);
                currentMidi = seg.midi;
                stringOsc.frequency.setValueAtTime(targetFund, segmentEndTime);
            }
        } else {
            const currentFund = 440 * Math.pow(2, (currentMidi - 69) / 12);
            stringOsc.frequency.setValueAtTime(currentFund, segmentEndTime);
        }
        timeCursor = segmentEndTime;
    }

    stringOsc.start(startTime);

    const fadeOutTime = 0.015;
    const stopTime = startTime + totalDecayTime;

    mainGain.gain.setValueAtTime(0.001, stopTime - fadeOutTime);
    mainGain.gain.linearRampToValueAtTime(0, stopTime);
    stringOsc.stop(stopTime);
};