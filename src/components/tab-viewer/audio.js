// --- Static Configuration Matrix ---
export const TUNING = {
    1: { baseMidi: 69 }, // A4
    2: { baseMidi: 64 }, // E4
    3: { baseMidi: 60 }, // C4 (Middle C)
    4: { baseMidi: 55 }, // G3
    5: { baseMidi: 50 }, // D3
    6: { baseMidi: 45 }  // A2
};

export const NOTE_NAMES = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B"
];

export const RHYTHM_BEAT_VALUES = {
    o: 4.0,
    "o.": 6.0,
    ".": 2.0,
    "..": 3.0,
    ":": 1.0,
    ":.": 1.5,
    "+": 0.5,
    "+.": 0.75,
    "=": 0.25,
    r: 1.0,
    "r.": 1.5,
    "r+": 0.5,
    "r=": 0.25
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

    const playMutedPercussion = (time, dur = 0.05, vel = 0.5) => {
        // High-efficiency procedural pick-scratch transient without heavy buffer re-allocation
        const lowThump = ctx.createOscillator();
        const highScrape = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const g = ctx.createGain();

        lowThump.type = 'triangle';
        lowThump.frequency.setValueAtTime(95, time);

        highScrape.type = 'sawtooth';
        highScrape.frequency.setValueAtTime(1400, time);
        highScrape.detune.setValueAtTime((Math.random() * 40) - 20, time);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, time);
        filter.Q.value = 2.0;

        g.gain.setValueAtTime(vel * 0.18, time);
        g.gain.exponentialRampToValueAtTime(0.001, time + dur);

        lowThump.connect(g);
        highScrape.connect(filter);
        filter.connect(g);

        g.connect(getMasterGain(ctx));

        lowThump.start(time);
        highScrape.start(time);
        lowThump.stop(time + dur);
        highScrape.stop(time + dur);
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

    // --- REPLACE THE OSCILLATOR CONFIGURATION BLOCK ---
    // 1. Core Nylon String Fundamental Layer
    const stringOsc = ctx.createOscillator();
    stringOsc.type = 'triangle';
    const detuneA = (Math.random() * 3) - 1.5;
    stringOsc.frequency.setValueAtTime(initialFundamental, startTime);
    stringOsc.detune.setValueAtTime(detuneA, startTime);

    // 2. Low-End Acoustic Body Fundamental Thump (Decays quickly)
    const bassSubOsc = ctx.createOscillator();
    bassSubOsc.type = 'sine';
    const bassGain = ctx.createGain();
    bassGain.gain.setValueAtTime(effectiveVelocity * 0.24, startTime);
    bassGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35); // Rapid decay to keep mix clear
    bassSubOsc.frequency.setValueAtTime(initialFundamental, startTime);
    bassSubOsc.detune.setValueAtTime((Math.random() * 4) - 2, startTime);

    // 3. Bright Pick Attack Transient (Fades out almost immediately)
    const brightTransientOsc = ctx.createOscillator();
    brightTransientOsc.type = 'sawtooth';
    const brightGain = ctx.createGain();
    brightGain.gain.setValueAtTime(effectiveVelocity * 0.12, startTime);
    brightGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.04); // Instant snap
    brightTransientOsc.frequency.setValueAtTime(initialFundamental * 2.5, startTime);

    // Route secondary layers into the principal synthesis channel
    stringOsc.connect(mainGain);
    bassSubOsc.connect(bassGain);
    bassGain.connect(mainGain);
    brightTransientOsc.connect(brightGain);
    brightGain.connect(mainGain);


    // Continuous Pitch Timeline Automation
    let timeCursor = startTime;
    let currentMidi = initialMidi;

    // --- REPLACE THE INTERNALS OF THE SEGMENTS AUTOMATION LOOP ---
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
            bassSubOsc.frequency.setValueAtTime(startFund, segmentStartTime);

            stringOsc.frequency.linearRampToValueAtTime(targetFund, segmentEndTime);
            bassSubOsc.frequency.linearRampToValueAtTime(targetFund, segmentEndTime);
            currentMidi = seg.midi;
        } else if (seg.type === 'hammer' || seg.type === 'pull') {
            if (hasMidi) {
                const targetFund = 440 * Math.pow(2, (seg.midi - 69) / 12);
                stringOsc.frequency.setValueAtTime(targetFund, segmentStartTime);
                bassSubOsc.frequency.setValueAtTime(targetFund, segmentStartTime);
                currentMidi = seg.midi;
                stringOsc.frequency.setValueAtTime(targetFund, segmentEndTime);
                bassSubOsc.frequency.setValueAtTime(targetFund, segmentEndTime);
            }
        } else {
            const currentFund = 440 * Math.pow(2, (currentMidi - 69) / 12);
            stringOsc.frequency.setValueAtTime(currentFund, segmentEndTime);
            bassSubOsc.frequency.setValueAtTime(currentFund, segmentEndTime);
        }
        timeCursor = segmentEndTime;
    }

    // Start and stop all nodes in sync
    stringOsc.start(startTime);
    bassSubOsc.start(startTime);
    brightTransientOsc.start(startTime);

    const fadeOutTime = 0.015;
    const stopTime = startTime + totalDecayTime;

    mainGain.gain.setValueAtTime(0.001, stopTime - fadeOutTime);
    mainGain.gain.linearRampToValueAtTime(0, stopTime);

    stringOsc.stop(stopTime);
    bassSubOsc.stop(stopTime);
    brightTransientOsc.stop(stopTime);
};

export function stopPlaying(lookaheadTimerRef, playbackTimeoutsRef, setIsPlaying, setIsPaused, setPlaybackIndex, pausedTimeRef, audioCtxRef) {
    return () => {
        if (lookaheadTimerRef.current) {
            clearTimeout(lookaheadTimerRef.current);
            lookaheadTimerRef.current = null;
        }
        playbackTimeoutsRef.current.forEach(t => clearTimeout(t));
        playbackTimeoutsRef.current = [];

        setIsPlaying(false);
        setIsPaused(false);
        setPlaybackIndex(null);
        pausedTimeRef.current = 0;

        if (audioCtxRef.current) {
            audioCtxRef.current.close();
            audioCtxRef.current = null;
        }
    };
}

export function pausePlaying(isPlaying, isPaused, lookaheadTimerRef, playbackTimeoutsRef, audioCtxRef, playbackStartTimeRef, pausedTimeRef, setIsPaused) {
    return () => {
        if (!isPlaying || isPaused) return;

        if (lookaheadTimerRef.current) {
            clearTimeout(lookaheadTimerRef.current);
            lookaheadTimerRef.current = null;
        }
        playbackTimeoutsRef.current.forEach(t => clearTimeout(t));
        playbackTimeoutsRef.current = [];

        const elapsedSec = audioCtxRef.current.currentTime - playbackStartTimeRef.current;
        pausedTimeRef.current += elapsedSec;

        setIsPaused(true);
        if (audioCtxRef.current) {
            audioCtxRef.current.suspend();
        }
    };
}

export function startPlaying(isPlaying, scoreLayout, isAudioCompiled, audioCtxRef, setIsPlaying, setIsPaused, pausedTimeRef, playbackStartTimeRef, currentPlaybackEventsRef, playbackStartBeatRef, preCompiledTimelineRef, currentTimelineBeatsRef, nextBeatIndexRef, runSchedulerLoop) {
    return (fromMeasure = 1) => {
        if (isPlaying || !scoreLayout || !isAudioCompiled) return;

        // Sync hook initiation for mobile WebKit audio focus
        if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
            audioCtxRef.current = new (
                window.AudioContext || window.webkitAudioContext
            )();
        }

        setIsPlaying(true);
        setIsPaused(false);
        pausedTimeRef.current = 0;
        playbackStartTimeRef.current = audioCtxRef.current.currentTime;

        const allEvents = scoreLayout.computedRows.flatMap(r => r.rowEvents);
        const targetedEvents = allEvents.filter(
            ev => ev.measureNumber >= fromMeasure
        );

        currentPlaybackEventsRef.current = targetedEvents;
        const startOffsetBeat = targetedEvents.length > 0 ? targetedEvents[0].startBeat : 0;
        playbackStartBeatRef.current = startOffsetBeat;

        // Group our precompiled notes by their exact startBeat timestamp
        const notesForRun = preCompiledTimelineRef.current.filter(
            n => n.startBeat >= startOffsetBeat
        );

        // Create an ordered timeline map of unique beat moments
        const uniqueBeatsMap = {};
        notesForRun.forEach(note => {
            if (!uniqueBeatsMap[note.startBeat]) {
                uniqueBeatsMap[note.startBeat] = {
                    startBeat: note.startBeat,
                    globalIndex: note.globalIndex, // Map to layout position for UI highlights
                    notes: []
                };
            }
            uniqueBeatsMap[note.startBeat].notes.push(note);
        });

        // Sort chronologically
        currentTimelineBeatsRef.current = Object.values(uniqueBeatsMap).sort(
            (a, b) => a.startBeat - b.startBeat
        );
        nextBeatIndexRef.current = 0;

        runSchedulerLoop(startOffsetBeat);
    };
}

export function resumePlaying(isPlaying, isPaused, audioCtxRef, playbackStartTimeRef, setIsPaused, runSchedulerLoop) {
    return () => {
        if (!isPlaying || !isPaused) return;

        if (audioCtxRef.current) {
            audioCtxRef.current.resume();
            playbackStartTimeRef.current = audioCtxRef.current.currentTime;
            setIsPaused(false);

            runSchedulerLoop();
        }
    };
}

export function runScheduler(
    playbackStartBeatRef,
    audioCtxRef,
    bpm,
    playbackStartTimeRef,
    pausedTimeRef,
    nextBeatIndexRef,
    currentTimelineBeatsRef,
    scheduleAheadTime,
    setPlaybackIndex,
    playbackTimeoutsRef,
    stopPlayback,
    lookaheadTimerRef,
    lookaheadInterval
) {
    return (startOffsetBeat = null) => {
        const offsetBeat = startOffsetBeat !== null
            ? startOffsetBeat
            : playbackStartBeatRef.current;
        const ctx = audioCtxRef.current;
        const beatDurationSeconds = 60 / bpm;
        const scheduleOffsetSec = 0.2; // 200ms padding for smooth scheduling on heavy layouts

        const scheduleTimelineChunk = () => {
            if (!ctx || ctx.state === "closed") return;

            const absoluteCurrentPlaybackTime = ctx.currentTime -
                playbackStartTimeRef.current +
                pausedTimeRef.current;

            // --- PERFORMANCE OPTIMIZATION: BATCH BOUNDARIES ---
            let iterations = 0;
            const MAX_ITERATIONS_PER_TICK = 32; // Prevents the main thread from locking up 
            const timelineLength = currentTimelineBeatsRef.current.length;
            const targetHorizonTime = absoluteCurrentPlaybackTime + scheduleAheadTime;

            while (nextBeatIndexRef.current < timelineLength && iterations < MAX_ITERATIONS_PER_TICK) {
                const beatSlice = currentTimelineBeatsRef.current[nextBeatIndexRef.current];
                const eventAbsoluteSec = (beatSlice.startBeat - offsetBeat) * beatDurationSeconds;

                // If this note's execution window is in the future, stop checking completely.
                if (eventAbsoluteSec >= targetHorizonTime) {
                    break;
                }

                // Increment tracking immediately to prevent infinite loops on error
                nextBeatIndexRef.current++;
                iterations++;

                const fallbackNote = beatSlice.notes[0];
                const jitter = fallbackNote ? fallbackNote.preCalculatedJitter : 0;
                const finalPluckTime = playbackStartTimeRef.current -
                    pausedTimeRef.current +
                    scheduleOffsetSec +
                    eventAbsoluteSec +
                    jitter;

                // 1. Dispatch audio nodes instantly to the Web Audio timeline queue
                // (Using your exact, pristine playHumanizedGuitaleleNote implementation)
                beatSlice.notes.forEach(note => {
                    const runtimeSegments = note.segments.map(seg => ({
                        ...seg,
                        duration: seg.duration * beatDurationSeconds
                    }));

                    playHumanizedGuitaleleNote(
                        ctx,
                        runtimeSegments,
                        finalPluckTime,
                        null,
                        note.type === "mute" ? 0 : note.preCalculatedVelocity
                    );
                });

                // 2. High-precision visual state synchronization tracking
                const timeUntilVisualMs = Math.max(
                    0,
                    (eventAbsoluteSec - absoluteCurrentPlaybackTime + scheduleOffsetSec) * 1000
                );

                const visualTimeout = setTimeout(() => {
                    setPlaybackIndex(beatSlice.globalIndex);
                }, timeUntilVisualMs);

                playbackTimeoutsRef.current.push(visualTimeout);

                // Process tied notes visual tracking efficiently
                beatSlice.notes.forEach(note => {
                    note.segments.forEach(seg => {
                        if (seg.tiedEventIndices) {
                            seg.tiedEventIndices.forEach(tiedEvent => {
                                const tiedAbsoluteSec = eventAbsoluteSec + tiedEvent.beatOffset * beatDurationSeconds;
                                const timeUntilTiedVisualMs = Math.max(
                                    0,
                                    (tiedAbsoluteSec - absoluteCurrentPlaybackTime + scheduleOffsetSec) * 1000
                                );

                                const tiedVisualTimeout = setTimeout(() => {
                                    setPlaybackIndex(tiedEvent.globalIndex);
                                }, timeUntilTiedVisualMs);

                                playbackTimeoutsRef.current.push(tiedVisualTimeout);
                            });
                        }
                    });
                });
            }

            // End tracking termination
            if (nextBeatIndexRef.current >= timelineLength) {
                const lastSlice = currentTimelineBeatsRef.current[timelineLength - 1];
                if (lastSlice) {
                    const maxSustainBeats = Math.max(
                        ...lastSlice.notes.map(n => n.segments.reduce((acc, s) => acc + s.duration, 0)),
                        1.0
                    );

                    const totalDurationSec = (lastSlice.startBeat - offsetBeat + maxSustainBeats) * beatDurationSeconds;
                    const timeUntilEndMs = (totalDurationSec - absoluteCurrentPlaybackTime + scheduleOffsetSec) * 1000;

                    const endTimeout = setTimeout(() => {
                        stopPlayback();
                    }, Math.max(0, timeUntilEndMs));
                    playbackTimeoutsRef.current.push(endTimeout);
                }
                return;
            }

            // Queue up the next lookahead slice
            lookaheadTimerRef.current = setTimeout(
                scheduleTimelineChunk,
                lookaheadInterval
            );
        };

        scheduleTimelineChunk();
    };
}
