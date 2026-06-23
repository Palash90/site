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
        masterGain.gain.value = 0.50;

        const limiter = ctx.createDynamicsCompressor();
        limiter.threshold.setValueAtTime(-12.0, ctx.currentTime);
        limiter.knee.setValueAtTime(12.0, ctx.currentTime);
        limiter.ratio.setValueAtTime(6.0, ctx.currentTime);
        limiter.attack.setValueAtTime(0.002, ctx.currentTime);
        limiter.release.setValueAtTime(0.10, ctx.currentTime);

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
    nylonDampFilter.frequency.setValueAtTime(Math.min(1000, initialFundamental * 2.0), startTime);
    nylonDampFilter.frequency.exponentialRampToValueAtTime(Math.min(220, initialFundamental * 1.0), startTime + Math.min(totalDuration, 0.6));

    const bodyWarmth = ctx.createBiquadFilter();
    bodyWarmth.type = 'lowshelf';
    bodyWarmth.frequency.value = 400;
    bodyWarmth.gain.value = 5.0;

    mainGain.connect(nylonDampFilter);
    nylonDampFilter.connect(bodyWarmth);
    bodyWarmth.connect(getMasterGain(ctx));

    const attackTime = 0.010;
    const totalDecayTime = Math.max(totalDuration * 0.95, 1.2);

    mainGain.gain.setValueAtTime(0, startTime);
    mainGain.gain.linearRampToValueAtTime(effectiveVelocity * 0.50, startTime + attackTime);
    mainGain.gain.exponentialRampToValueAtTime(effectiveVelocity * 0.20, startTime + 0.08);
    mainGain.gain.exponentialRampToValueAtTime(0.001, startTime + totalDecayTime - 0.02);

    // --- REPLACE THE OSCILLATOR CONFIGURATION BLOCK ---
    // 1. Core Nylon String Fundamental Layer (pure tone for warmth)
    const stringOsc = ctx.createOscillator();
    stringOsc.type = 'sine';
    const detuneA = (Math.random() * 3) - 1.5;
    stringOsc.frequency.setValueAtTime(initialFundamental, startTime);
    stringOsc.detune.setValueAtTime(detuneA, startTime);

    // 2. Low-End Acoustic Body Fundamental Thump (Decays quickly)
    const bassSubOsc = ctx.createOscillator();
    bassSubOsc.type = 'sine';
    const bassGain = ctx.createGain();
    bassGain.gain.setValueAtTime(effectiveVelocity * 0.30, startTime);
    bassGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);
    bassSubOsc.frequency.setValueAtTime(initialFundamental, startTime);
    bassSubOsc.detune.setValueAtTime((Math.random() * 4) - 2, startTime);

    // 3. Soft Nail Transient (brief finger contact warmth)
    const brightTransientOsc = ctx.createOscillator();
    brightTransientOsc.type = 'sine';
    const brightGain = ctx.createGain();
    brightGain.gain.setValueAtTime(effectiveVelocity * 0.04, startTime);
    brightGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.02);
    brightTransientOsc.frequency.setValueAtTime(initialFundamental * 3.0, startTime);

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

const clearPlaybackCallbacks = playbackTimeoutsRef => {
    playbackTimeoutsRef.current.forEach(cancelScheduledWork => {
        cancelScheduledWork();
    });
    playbackTimeoutsRef.current = [];
};

const registerManagedTimeout = (playbackTimeoutsRef, callback, delayMs) => {
    let timeoutId = null;
    const cancelScheduledWork = () => {
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
    };

    timeoutId = setTimeout(() => {
        cancelScheduledWork();
        playbackTimeoutsRef.current = playbackTimeoutsRef.current.filter(
            cancel => cancel !== cancelScheduledWork
        );
        callback();
    }, delayMs);

    playbackTimeoutsRef.current.push(cancelScheduledWork);
    return cancelScheduledWork;
};

export function stopPlaying(lookaheadTimerRef, playbackTimeoutsRef, setIsPlaying, setIsPaused, setPlaybackIndex, pausedTimeRef, audioCtxRef) {
    return () => {
        if (lookaheadTimerRef.current) {
            clearTimeout(lookaheadTimerRef.current);
            lookaheadTimerRef.current = null;
        }
        clearPlaybackCallbacks(playbackTimeoutsRef);

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
        clearPlaybackCallbacks(playbackTimeoutsRef);

        const elapsedSec = audioCtxRef.current.currentTime - playbackStartTimeRef.current;
        pausedTimeRef.current += elapsedSec;

        setIsPaused(true);
        if (audioCtxRef.current) {
            audioCtxRef.current.suspend();
        }
    };
}

export function startPlaying(isPlaying, scoreLayout, isAudioCompiled, audioCtxRef, setIsPlaying, setIsPaused, pausedTimeRef, playbackStartTimeRef, currentPlaybackEventsRef, playbackStartBeatRef, preCompiledTimelineRef, currentTimelineBeatsRef, nextBeatIndexRef, runSchedulerLoop, voice1Enabled, voice2Enabled, metronomeEnabled) {
    return (fromMeasure = 1) => {
        if (isPlaying || !scoreLayout || !isAudioCompiled) return;

        // Sync hook initiation for mobile WebKit audio focus
        if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
            audioCtxRef.current = new (
                window.AudioContext || window.webkitAudioContext
            )();
        }

        // Ensure the AudioContext is running (some browsers start it suspended)
        if (audioCtxRef.current.state === "suspended") {
            audioCtxRef.current.resume();
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
        const instrumentNotes = preCompiledTimelineRef.current.filter(
            n => n.startBeat >= startOffsetBeat
        ).filter(n => {
            if (n.voice === 1 && !voice1Enabled) return false;
            if (n.voice === 2 && !voice2Enabled) return false;
            return true;
        });

        const metronomeTicks = [];
        targetedEvents.forEach(ev => {
            const isExplicitTick = ev.isMetronomeTick;
            const isIntegerBeat = ev.beatOffset !== undefined && (ev.beatOffset % 1.0 === 0);

            if (isExplicitTick || isIntegerBeat) {
                const isDuplicate = metronomeTicks.some(tick => tick.startBeat === ev.startBeat);
                if (!isDuplicate) {
                    metronomeTicks.push({
                        startBeat: ev.startBeat,
                        globalIndex: ev.globalIndex,
                        voice: 0,
                        isMetronomeTick: true,
                        isDownbeat: ev.isDownbeat || (ev.beatOffset === 0),
                        segments: [],
                        preCalculatedJitter: 0,
                        preCalculatedVelocity: 1.0
                    });
                }
            }
        });


        // Add a count-in measure of metronome ticks that always play before content starts
        const numerator = parseInt(scoreLayout.timeSigTop, 10);
        const denominator = parseInt(scoreLayout.timeSigBottom, 10);
        const clickBeatSpacing = 4 / denominator;
        const beatsPerMeasure = scoreLayout.beatsPerMeasure;
        for (let click = 0; click < numerator; click++) {
            const clickStartBeat = startOffsetBeat - beatsPerMeasure + (click * clickBeatSpacing);
            metronomeTicks.unshift({
                startBeat: clickStartBeat,
                globalIndex: -(click + 1),
                voice: 0,
                isMetronomeTick: true,
                isPreviewTick: true,
                isDownbeat: click === 0,
                segments: [],
                preCalculatedJitter: 0,
                preCalculatedVelocity: 1.0
            });
        }

        const combinedTimeline = [...instrumentNotes, ...metronomeTicks];

        // Shift the playback start beat to the first preview tick so all scheduling times are non-negative
        const firstPreviewTickStart = startOffsetBeat - beatsPerMeasure;
        playbackStartBeatRef.current = firstPreviewTickStart;

        const uniqueBeatsMap = {};
        combinedTimeline.forEach(note => {
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

        runSchedulerLoop(firstPreviewTickStart);
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

/**
 * Synthesizes a highly prominent, punchy metronome click that cuts through the guitar layers.
 */
export const playMetronomeClick = (ctx, startTime, isDownbeat = false) => {
    // 1. The Core Woodblock/Clave Body (Thump)
    const bodyOsc = ctx.createOscillator();
    const bodyGain = ctx.createGain();

    // Use a triangle wave for crisp harmonic presence instead of a soft sine wave
    bodyOsc.type = "triangle";
    // Pitch it up significantly so it sits in a different frequency range than the guitalele
    bodyOsc.frequency.setValueAtTime(isDownbeat ? 1400 : 950, startTime);

    // Ultra-snappy volume decay envelope to create a percussive "pop"
    bodyGain.gain.setValueAtTime(0.0, startTime);
    bodyGain.gain.linearRampToValueAtTime(isDownbeat ? 0.55 : 0.38, startTime + 0.002);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.035);

    // 2. The Transient Crack Layer (The high-frequency snap of a wood stick)
    const snapOsc = ctx.createOscillator();
    const snapGain = ctx.createGain();

    snapOsc.type = "sine";
    // Extreme high pitch creates an immediate piercing audio spike to catch the ear
    snapOsc.frequency.setValueAtTime(isDownbeat ? 3200 : 2600, startTime);

    snapGain.gain.setValueAtTime(0.0, startTime);
    snapGain.gain.linearRampToValueAtTime(isDownbeat ? 0.30 : 0.18, startTime + 0.001);
    snapGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.012); // Instant decay

    // Routing all elements to the output matrix
    bodyOsc.connect(bodyGain);
    snapOsc.connect(snapGain);

    if (ctx.masterGain) {
        bodyGain.connect(ctx.masterGain);
        snapGain.connect(ctx.masterGain);
    } else {
        bodyGain.connect(ctx.destination);
        snapGain.connect(ctx.destination);
    }

    // Fire nodes simultaneously
    bodyOsc.start(startTime);
    snapOsc.start(startTime);

    bodyOsc.stop(startTime + 0.05);
    snapOsc.stop(startTime + 0.02);
};

/**
 * Synthesizes a short, crisp stick-click sound (drum sticks tapping together).
 * Uses a noise burst through a bandpass filter for a distinctly different timbre
 * from the regular metronome woodblock click.
 */
export const playStickClick = (ctx, startTime) => {
    const burstDuration = 0.025;
    const sampleRate = ctx.sampleRate;
    const bufferSize = Math.max(1, Math.ceil(sampleRate * burstDuration));
    const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.setValueAtTime(3500, startTime);
    bandpass.Q.setValueAtTime(1.5, startTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.45, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + burstDuration);

    noise.connect(bandpass);
    bandpass.connect(gain);

    if (ctx.masterGain) {
        gain.connect(ctx.masterGain);
    } else {
        gain.connect(ctx.destination);
    }

    noise.start(startTime);
    noise.stop(startTime + burstDuration);
};
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
    lookaheadInterval,
    metronomeEnabled
) {
    return (startOffsetBeat = null) => {
        const offsetBeat = startOffsetBeat !== null
            ? startOffsetBeat
            : playbackStartBeatRef.current;
        const ctx = audioCtxRef.current;
        const beatDurationSeconds = 60 / bpm;
        const scheduleOffsetSec = 0.2; // 200ms padding for smooth scheduling on heavy layouts
        const visualQueue = [];
        let visualFrameId = null;

        const cancelVisualQueue = () => {
            if (visualFrameId !== null) {
                cancelAnimationFrame(visualFrameId);
                visualFrameId = null;
            }
            visualQueue.length = 0;
        };

        playbackTimeoutsRef.current.push(cancelVisualQueue);

        const insertVisualUpdate = visualUpdate => {
            const insertIndex = visualQueue.findIndex(
                queuedUpdate => queuedUpdate.audioTime > visualUpdate.audioTime
            );

            if (insertIndex === -1) {
                visualQueue.push(visualUpdate);
            } else {
                visualQueue.splice(insertIndex, 0, visualUpdate);
            }
        };

        const startVisualQueue = () => {
            if (visualFrameId !== null) return;

            const runVisualFrame = () => {
                if (!ctx || ctx.state === "closed") {
                    visualFrameId = null;
                    return;
                }

                let nextPlaybackIndex = null;
                const currentAudioTime = ctx.currentTime;

                while (
                    visualQueue.length > 0 &&
                    visualQueue[0].audioTime <= currentAudioTime
                ) {
                    nextPlaybackIndex = visualQueue.shift().globalIndex;
                }

                if (nextPlaybackIndex !== null) {
                    setPlaybackIndex(nextPlaybackIndex);
                }

                visualFrameId = visualQueue.length > 0
                    ? requestAnimationFrame(runVisualFrame)
                    : null;
            };

            visualFrameId = requestAnimationFrame(runVisualFrame);
        };

        const queueVisualUpdate = (audioTime, globalIndex) => {
            insertVisualUpdate({ audioTime, globalIndex });
            startVisualQueue();
        };

        const scheduleTimelineChunk = () => {
            if (!ctx || ctx.state === "closed") return;

            const absoluteCurrentPlaybackTime = ctx.currentTime -
                playbackStartTimeRef.current +
                pausedTimeRef.current;

            let iterations = 0;
            const MAX_ITERATIONS_PER_TICK = 32;
            const timelineLength = currentTimelineBeatsRef.current.length;
            const targetHorizonTime = absoluteCurrentPlaybackTime + scheduleAheadTime;

            while (nextBeatIndexRef.current < timelineLength && iterations < MAX_ITERATIONS_PER_TICK) {
                const beatSlice = currentTimelineBeatsRef.current[nextBeatIndexRef.current];

                if (!beatSlice) {
                    nextBeatIndexRef.current++;
                    continue;
                }

                const eventAbsoluteSec = (beatSlice.startBeat - offsetBeat) * beatDurationSeconds;

                // If this note's execution window is in the future, stop checking completely.
                if (eventAbsoluteSec >= targetHorizonTime) {
                    break;
                }

                // Increment tracking immediately to prevent infinite loops
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
                beatSlice.notes.forEach(note => {
                    // This is the correct, safely timed metronome handler:
                    if (note.isMetronomeTick && (metronomeEnabled || note.isPreviewTick)) {
                        if (note.isPreviewTick) {
                            playStickClick(ctx, finalPluckTime);
                        } else {
                            playMetronomeClick(ctx, finalPluckTime, note.isDownbeat);
                        }
                        return;
                    }

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
                const visualAudioTime = playbackStartTimeRef.current -
                    pausedTimeRef.current +
                    scheduleOffsetSec +
                    eventAbsoluteSec;
                queueVisualUpdate(visualAudioTime, beatSlice.globalIndex);

                // Process tied notes visual tracking efficiently
                beatSlice.notes.forEach(note => {
                    if (note.isMetronomeTick) return;
                    note.segments.forEach(seg => {
                        if (seg.tiedEventIndices) {
                            seg.tiedEventIndices.forEach(tiedEvent => {
                                const tiedAbsoluteSec = eventAbsoluteSec + tiedEvent.beatOffset * beatDurationSeconds;
                                const tiedVisualAudioTime = playbackStartTimeRef.current -
                                    pausedTimeRef.current +
                                    scheduleOffsetSec +
                                    tiedAbsoluteSec;
                                queueVisualUpdate(tiedVisualAudioTime, tiedEvent.globalIndex);
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
                        ...lastSlice.notes.map(n => n.segments ? n.segments.reduce((acc, s) => acc + s.duration, 0) : 1.0),
                        1.0
                    );

                    const totalDurationSec = (lastSlice.startBeat - offsetBeat + maxSustainBeats) * beatDurationSeconds;
                    const timeUntilEndMs = (totalDurationSec - absoluteCurrentPlaybackTime + scheduleOffsetSec) * 1000;

                    registerManagedTimeout(playbackTimeoutsRef, () => {
                        stopPlayback();
                    }, Math.max(0, timeUntilEndMs));
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
