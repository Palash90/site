import React, { useState, useMemo, useRef, useEffect } from "react";
import {
    DARK_THEME,
    calculateSchedulerBoundaries,
    getDurationLabel,
} from "./guitaleleViewerUtils";

import {
    stopPlaying,
    pausePlaying,
    resumePlaying,
    startPlaying,
    runScheduler
} from "./audio";
import { Table, Row, Col, Button, Form } from "react-bootstrap";

import { buildSvg } from "./svgUtils";
import { useBuildScoreLayout } from "./scoreBuilder";

export default function GuitaleleViewer({ scoreData }) {
    const [clickedNoteIndex, setClickedNoteIndex] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [playbackIndex, setPlaybackIndex] = useState(null);
    const [bpm, setBpm] = useState(100);
    const [playbackProgress, setPlaybackProgress] = useState(null);
    const [slotWidth, setSlotWidth] = useState(6);
    const containerRef = useRef(null);
    const viewerRef = useRef(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isAudioCompiled, setIsAudioCompiled] = useState(false);

    const [voice1Enabled, setVoice1Enabled] = useState(true);
    const [voice2Enabled, setVoice2Enabled] = useState(true);
    const [metronomeEnabled, setMetronomeEnabled] = useState(false);
    const [viewMode, setViewMode] = useState('tab'); // 'tab', 'both', 'sheet'

    const lookaheadTimerRef = useRef(null);

    const { lookaheadInterval, scheduleAheadTime } = useMemo(() => {
        return calculateSchedulerBoundaries(bpm);
    }, [bpm]);

    const currentTimelineBeatsRef = useRef([]); // Holds unique sorted beat time slices
    const nextBeatIndexRef = useRef(0);

    // --- Responsive Layout State ---
    const [measuresPerRow, setMeasuresPerRow] = useState(4);
    const [isStackedLayout, setIsStackedLayout] = useState(false);

    const audioCtxRef = useRef(null);
    const playbackTimeoutsRef = useRef([]);

    // Track playback state mapping
    const currentPlaybackEventsRef = useRef([]);
    const playbackStartBeatRef = useRef(0);
    const pausedTimeRef = useRef(0);
    const playbackStartTimeRef = useRef(0);

    // Responsive window observer
    useEffect(() => {
        const updateLayoutBoundaries = () => {
            if (window.innerWidth < 480) {
                setMeasuresPerRow(1);
                setSlotWidth(40);
                setIsStackedLayout(true);
            } else if (window.innerWidth < 768) {
                setMeasuresPerRow(2);
                setSlotWidth(50);
                setIsStackedLayout(true);
            } else {
                setMeasuresPerRow(4);
                setSlotWidth(50);
                setIsStackedLayout(false);
            }
        };

        updateLayoutBoundaries();
        window.addEventListener("resize", updateLayoutBoundaries);
        return () =>
            window.removeEventListener("resize", updateLayoutBoundaries);
    }, []);

    useEffect(() => {
        if (!isPlaying) {
            setClickedNoteIndex(null);
        }
    }, [isPlaying]);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            viewerRef.current?.requestFullscreen?.();
        } else {
            document.exitFullscreen?.();
        }
    };

    useEffect(() => {
        const handler = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handler);
        return () => document.removeEventListener('fullscreenchange', handler);
    }, []);

    const scoreLayout = useBuildScoreLayout(scoreData, slotWidth, measuresPerRow);

    const preCompiledTimelineRef = useRef([]);

    useEffect(() => {
        if (!scoreLayout) return;

        setIsAudioCompiled(false);

        const timer = setTimeout(() => {
            const allEvents = scoreLayout.computedRows.flatMap(
                r => r.rowEvents
            );
            const compiledAudioTimeline = [];
            const consumedPitches = new Set();



            allEvents.forEach((ev, evIdx) => {
                if (ev.isMetronomeTick) {
                    compiledAudioTimeline.push({
                        ...ev,
                        type: "metronome",
                        isMetronomeTick: true,
                        voice: 0,
                        startBeat: ev.startBeat,
                        globalIndex: ev.globalIndex,
                        preCalculatedJitter: 0,
                        preCalculatedVelocity: 0,
                        segments: [{ type: "rest", duration: ev.beatValue }]
                    });
                    return;
                }

                if (ev.isRest) {
                    // Include rest events in the precompiled timeline so they can be visually highlighted
                    compiledAudioTimeline.push({
                        type: "rest",
                        voice: ev.voice,
                        startBeat: ev.startBeat,
                        globalIndex: ev.globalIndex,
                        preCalculatedJitter: 0,
                        preCalculatedVelocity: 0,
                        segments: [{ type: "rest", duration: ev.beatValue }]
                    });
                    return;
                }

                ev.processedPitches.forEach(pitch => {
                    const pitchKey = `${ev.globalIndex}_${pitch.string}`;
                    if (consumedPitches.has(pitchKey)) return;

                    if (pitch.fret === null) {
                        compiledAudioTimeline.push({
                            type: "mute",
                            voice: ev.voice,
                            startBeat: ev.startBeat,
                            globalIndex: ev.globalIndex,
                            preCalculatedJitter: (Math.random() - 0.5) * 0.003, // Pre-calculate here!
                            preCalculatedVelocity: 0.88 + Math.random() * 0.22,
                            segments: [{ type: "mute", duration: ev.beatValue }]
                        });
                        return;
                    }

                    const segments = [
                        {
                            type: "pluck",
                            midi: pitch.midi,
                            duration: ev.beatValue
                        }
                    ];

                    let currentEvent = ev;
                    let currentEventIdx = evIdx;
                    let currentPitch = pitch;

                    while (currentEvent.isTiedToNext) {
                        const nextEvent = allEvents
                            .slice(currentEventIdx + 1)
                            .find(
                                e => e.voice === currentEvent.voice && !e.isRest
                            );
                        if (!nextEvent) break;

                        const nextPitch = nextEvent.processedPitches.find(
                            np => np.string === currentPitch.string
                        );
                        if (!nextPitch) break;

                        const nextDuration = nextEvent.beatValue;

                        if (!segments[segments.length - 1].tiedEventIndices) {
                            segments[segments.length - 1].tiedEventIndices = [];
                        }
                        segments[segments.length - 1].tiedEventIndices.push({
                            globalIndex: nextEvent.globalIndex,
                            beatOffset: nextEvent.startBeat - ev.startBeat
                        });

                        if (nextPitch.midi === currentPitch.midi) {
                            segments.push({
                                type: "tie",
                                midi: nextPitch.midi,
                                duration: nextDuration
                            });
                        } else {
                            const currentSeg = segments[segments.length - 1];
                            const halfDuration = currentSeg.duration / 2;
                            currentSeg.duration = halfDuration;

                            segments.push({
                                type: "slide",
                                midi: nextPitch.midi,
                                duration: halfDuration
                            });
                            segments.push({
                                type: "tie",
                                midi: nextPitch.midi,
                                duration: nextDuration
                            });
                        }

                        const nextKey = `${nextEvent.globalIndex}_${nextPitch.string}`;
                        consumedPitches.add(nextKey);

                        currentEventIdx = allEvents.indexOf(nextEvent);
                        currentEvent = nextEvent;
                        currentPitch = nextPitch;
                    }

                    compiledAudioTimeline.push({
                        type: "pluck",
                        voice: ev.voice,
                        startBeat: ev.startBeat,
                        globalIndex: ev.globalIndex,
                        midi: pitch.midi,
                        preCalculatedJitter: (Math.random() - 0.5) * 0.003, // Pre-calculate here!
                        preCalculatedVelocity: 0.88 + Math.random() * 0.22, // Pre-calculate here!
                        segments: segments
                    });
                });
            });

            preCompiledTimelineRef.current = compiledAudioTimeline;
            setIsAudioCompiled(true);
        }, 100);

        return () => clearTimeout(timer);
    }, [scoreLayout]);

    // Extract an array of all unique voice IDs present in the score
    const availableVoices = useMemo(() => {
        if (!scoreLayout || !scoreLayout.computedRows) return [];

        const allEvents = scoreLayout.computedRows.flatMap(r => r.rowEvents);
        const voiceIds = allEvents.map(ev => ev.voice);

        // Using a Set eliminates duplicates, then Array.from turns it back into a sorted array
        return Array.from(new Set(voiceIds)).sort((a, b) => a - b);
    }, [scoreLayout]);

    const stopPlayback = stopPlaying(lookaheadTimerRef, playbackTimeoutsRef, setIsPlaying, setIsPaused, setPlaybackIndex, pausedTimeRef, audioCtxRef);

    const pausePlayback = pausePlaying(isPlaying, isPaused, lookaheadTimerRef, playbackTimeoutsRef, audioCtxRef, playbackStartTimeRef, pausedTimeRef, setIsPaused);

    const runSchedulerLoop = runScheduler(playbackStartBeatRef, audioCtxRef, bpm, playbackStartTimeRef, pausedTimeRef, nextBeatIndexRef, currentTimelineBeatsRef, scheduleAheadTime, setPlaybackIndex, playbackTimeoutsRef, stopPlayback, lookaheadTimerRef, lookaheadInterval, metronomeEnabled);

    const resumePlayback = resumePlaying(isPlaying, isPaused, audioCtxRef, playbackStartTimeRef, setIsPaused, runSchedulerLoop);

    const startPlayback = startPlaying(isPlaying, scoreLayout, isAudioCompiled, audioCtxRef, setIsPlaying, setIsPaused, pausedTimeRef, playbackStartTimeRef, currentPlaybackEventsRef, playbackStartBeatRef, preCompiledTimelineRef, currentTimelineBeatsRef, nextBeatIndexRef, runSchedulerLoop, voice1Enabled, voice2Enabled, metronomeEnabled);


    useEffect(() => {
        return () => stopPlayback();
    }, []);

    const countInBeat = isPlaying && playbackIndex !== null && playbackIndex < 0 ? -playbackIndex : 0;
    const activeTargetIndex = isPlaying
        ? (isPaused && clickedNoteIndex !== null ? clickedNoteIndex : playbackIndex)
        : clickedNoteIndex;

    const handleNoteClick = (globalIndex) => {
        if (isPlaying && !isPaused) return;

        setClickedNoteIndex(prevIndex => {
            return prevIndex === globalIndex ? null : globalIndex;
        });
    };

    // Replace `activeEvent` with `activeEvents` and `activeIndices`
    const activeEvents = useMemo(() => {
        if (activeTargetIndex === null || !scoreLayout) return [];

        const allEvents = scoreLayout.computedRows.flatMap(r => r.rowEvents);
        const targetEvent = allEvents.find(
            ev => ev.globalIndex === activeTargetIndex
        );

        if (!targetEvent) return [];

        // Fetch all playable events at this beat. Metronome-only beats should not drive note highlighting.
        return allEvents.filter(
            ev =>
                ev.measureNumber === targetEvent.measureNumber &&
                ev.startBeat === targetEvent.startBeat &&
                !ev.isMetronomeTick
        ).sort((a, b) => (a.voice || 1) - (b.voice || 1));
    }, [activeTargetIndex, scoreLayout]);

    const activeIndices = useMemo(
        () => activeEvents.map(e => e.globalIndex),
        [activeEvents]
    );

    // Compute global track statistics
    const trackStats = useMemo(() => {
        if (!scoreLayout || !scoreData) return null;

        const totalMeasures = scoreData.measures?.length || 0;
        const timeSig = scoreData.timeSignature || '4/4';
        const keySig = scoreData.key || scoreData.keySignature || 'C';
        const numerator = parseInt(timeSig.split('/')[0], 10) || 4;
        const denominator = parseInt(timeSig.split('/')[1], 10) || 4;
        const beatsPerMeasure = numerator * (4 / denominator);
        const totalBeats = totalMeasures * beatsPerMeasure;
        const totalSeconds = (totalBeats * 60) / bpm;

        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.round(totalSeconds % 60);

        // Count distinct notes (non-rest, non-metronome)
        const allEvents = scoreLayout.computedRows?.flatMap(r => r.rowEvents) || [];
        const noteCount = allEvents.filter(ev => !ev.isRest && !ev.isMetronomeTick).length;

        return {
            totalMeasures,
            timeSig,
            keySig,
            bpm,
            totalDuration: `${minutes}:${seconds.toString().padStart(2, '0')}`,
            noteCount,
            beatsPerMeasure
        };
    }, [scoreLayout, scoreData, bpm]);

    const activeDescription = useMemo(() => {
        if (!activeEvents || activeEvents.length === 0) return null;

        const voiceColors = ['#21cea3', '#fb923c'];

        const v1Events = activeEvents.filter(ev => ev.voice === 1);
        const v2Events = activeEvents.filter(ev => ev.voice === 2);

        const renderVoiceColumn = (events, voiceLabel, color) => {
            if (events.length === 0) return null;
            return (
                <div style={{ flex: '1 1 0', minWidth: 0, borderLeft: `2px solid ${color}`, paddingLeft: '8px' }}>
                    {events.map((ev, idx) => {
                        const notes = ev.isRest
                            ? [{ noteName: 'Rest' }]
                            : ev.processedPitches;
                        return (
                            <div key={idx}>
                                <div style={{ fontSize: '10px', color: '#8892b0', marginBottom: '1px' }}>
                                    <span style={{ color }}>{voiceLabel}</span>
                                    {!ev.isRest && <span style={{ marginLeft: '4px' }}>{getDurationLabel(ev.beatValue)}</span>}
                                </div>
                                {notes.map((p, pIdx) => (
                                    <div key={pIdx} style={{ color, fontSize: '13px', fontWeight: '600', lineHeight: 1.3 }}>
                                        {p.fret === null ? (
                                            <span style={{ color: '#aaccff', fontStyle: 'italic', fontWeight: '400', fontSize: '11px' }}>
                                                Muted s{p.string}
                                            </span>
                                        ) : (
                                            <span style={{ color: '#dfe6e9', fontWeight: '400' }}>
                                                {p.noteName}
                                                {p.string !== undefined && <span style={{ color: '#8892b0', fontSize: '11px', marginLeft: '4px' }}>s{p.string} f{p.fret}</span>}
                                            </span>
                                        )}
                                    </div>
                                ))}
                                {ev.description && (
                                    <div style={{ fontSize: '10px', color: '#aaccff', fontStyle: 'italic', lineHeight: 1.2, marginTop: '1px' }}>
                                        {ev.description}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            );
        };

        return (
            <div className="d-flex" style={{ gap: '12px' }}>
                {v1Events.length > 0 && renderVoiceColumn(v1Events, 'V1', voiceColors[0])}
                {v2Events.length > 0 && renderVoiceColumn(v2Events, 'V2', voiceColors[1])}
            </div>
        );
    }, [activeEvents]);

    // Compute playback progress from beat position (monotonic, unlike event index)
    const beatRange = useMemo(() => {
        if (!scoreLayout || !scoreLayout.computedRows) return null;
        const allEvents = scoreLayout.computedRows.flatMap(r => r.rowEvents);
        if (allEvents.length === 0) return null;
        const firstBeat = allEvents[0].startBeat;
        const lastEv = allEvents[allEvents.length - 1];
        const lastBeat = lastEv.startBeat + (lastEv.beatValue || 1);
        return { firstBeat, lastBeat, totalBeats: lastBeat - firstBeat };
    }, [scoreLayout]);

    useEffect(() => {
        if (isPlaying && playbackIndex !== null && beatRange && beatRange.totalBeats > 0) {
            if (playbackIndex < 0) {
                // Count-in beats — progress is 0
                setPlaybackProgress(0);
                return;
            }
            const allEvents = scoreLayout.computedRows.flatMap(r => r.rowEvents);
            const currentEvent = allEvents.find(ev => ev.globalIndex === playbackIndex);
            if (currentEvent) {
                const currentBeat = currentEvent.startBeat;
                const rawProgress = ((currentBeat - beatRange.firstBeat) / beatRange.totalBeats) * 100;
                const progress = Math.max(0, Math.min(100, Math.round(rawProgress)));
                setPlaybackProgress(progress);
            } else {
                setPlaybackProgress(0);
            }
        } else if (!isPlaying) {
            setPlaybackProgress(null);
        }
    }, [playbackIndex, isPlaying, beatRange, scoreLayout]);

    // 1. Find which row index contains the currently playing note index
    const activeRowIndex = useMemo(() => {
        if (playbackIndex === null || !scoreLayout) return -1;
        return scoreLayout.computedRows.findIndex(row =>
            row.rowEvents.some(ev => ev.globalIndex === playbackIndex)
        );
    }, [playbackIndex, scoreLayout]);

    // 2. Efficiently snap to the top of the row ONLY when changing lines
    const prevRowIndexRef = useRef(-1);
    useEffect(() => {
        const scrollContainer = containerRef.current;
        if (!scrollContainer) return;

        if (!isPlaying) {
            scrollContainer.scrollTo({
                top: 0,
                behavior: "smooth"
            });
            prevRowIndexRef.current = -1;
            return;
        }

        if (activeRowIndex !== -1 && activeRowIndex !== prevRowIndexRef.current) {
            prevRowIndexRef.current = activeRowIndex;

            const rowElements = scrollContainer.querySelectorAll("tbody tr");
            const targetRow = rowElements[activeRowIndex];

            if (targetRow) {
                const containerRect = scrollContainer.getBoundingClientRect();
                const rowRect = targetRow.getBoundingClientRect();

                // Calculate the position to line up the row's top edge perfectly with the container's top
                const targetScrollTop = rowRect.top - containerRect.top + scrollContainer.scrollTop;

                scrollContainer.scrollTo({
                    top: Math.max(0, targetScrollTop - 20), // 4px padding for a clean aesthetic look
                    behavior: "auto"
                });
            }
        }
    }, [activeRowIndex, isPlaying]);


    if (!scoreLayout) {
        return (
            <div className="text-slate-500 font-mono text-xs p-4">
                No notation data package available.
            </div>
        );
    }

    const {
        computedRows,
        timeSigTop,
        timeSigBottom,
        paddingX,
        trebleTopY,
        bassTopY,
        tabTopY,
        rhythmTopY,
        lineSpacing,
        SLOT_WIDTH,
        measureValidityMap,
        beatsPerMeasure
    } = scoreLayout;

    const rhythm1TopY = rhythmTopY;
    const rhythm2TopY = rhythmTopY + 28;

    return (
        <>
            <style>{`
                @keyframes countin-fade {
                    0% { opacity: 1; transform: scale(1.3); }
                    100% { opacity: 0; transform: scale(1); }
                }
            `}</style>
            <div
                ref={viewerRef}
                className="d-flex flex-column bg-dark"
                style={{
                    height: isFullscreen ? '100vh' : 'calc(100vh - 56px)',
                    overflow: 'hidden'
                }}
            >
            <div className={`bg-dark border-bottom border-secondary text-light shrink-0 ${isStackedLayout ? 'px-0 py-1' : 'p-2'}`} style={{ height: 'auto' }}>
                {isStackedLayout ? (
                    /* ----- Mobile: stacked rows ----- */
                    <div className="d-flex flex-column gap-1">
                        <div className="d-flex gap-1">
                            <div className="d-flex flex-column gap-1" style={{ flex: '2 1 auto' }}>
                                <div className="btn-group bg-black p-1 rounded border border-secondary" style={{ height: '30px', alignItems: 'center' }}>
                                    {!isPlaying ? (
                                        <Button variant="link" onClick={startPlayback} className="text-success p-1" title="Start"
                                            disabled={!((voice1Enabled && availableVoices.includes(1)) || (voice2Enabled && availableVoices.includes(2)) || metronomeEnabled)}>
                                            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                        </Button>
                                    ) : isPaused ? (
                                        <Button variant="link" onClick={resumePlayback} className="text-warning p-1" title="Resume">
                                            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                        </Button>
                                    ) : (
                                        <Button variant="link" onClick={pausePlayback} className="text-warning p-1" title="Pause">
                                            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                                        </Button>
                                    )}
                                    <Button variant="link" onClick={stopPlayback} disabled={!isPlaying} className={`p-1 ${isPlaying ? 'text-danger' : 'text-muted'}`} title="Stop">
                                        <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h12v12H6z" /></svg>
                                    </Button>
                                </div>
                                <div className="bg-black px-2 py-1 rounded border border-secondary d-flex align-items-center" style={{ height: '26px' }}>
                                    <Form.Range min="40" max="240" value={bpm}
                                        onChange={(e) => setBpm(parseInt(e.target.value, 10))}
                                        disabled={isPlaying} className="flex-grow-1" style={{ height: '5px' }} />
                                    <span className="text-warning fw-bold font-monospace" style={{ fontSize: '9px', minWidth: '22px' }}>{bpm}</span>
                                </div>
                                <div className="bg-black px-1 rounded border border-secondary d-flex align-items-center" style={{ height: '12px' }}>
                                    <div style={{ width: `${isPlaying && playbackProgress !== null ? playbackProgress : 0}%`, height: '4px',
                                        background: DARK_THEME.progressFill, borderRadius: '2px', transition: 'width 0.3s ease' }} />
                                </div>
                            </div>
                            <div className="d-flex flex-column gap-1" style={{ flex: '1 1 auto' }}>
                                <div className="bg-black px-2 py-1 rounded border border-secondary d-flex flex-column gap-1">
                                    <div style={{ fontSize: '8px', textTransform: 'uppercase', letterSpacing: '1px', color: '#586278' }}>Audio Tracks</div>
                                    <div className="d-flex align-items-center gap-1">
                                        <div className="d-flex align-items-center justify-content-between" style={{ width: '50px', height: '16px' }}>
                                            <span style={{ fontSize: '10px', color: voice1Enabled ? DARK_THEME.voice1Color : '#8892b0', fontWeight: 'bold' }}>V1</span>
                                            <Form.Check type="switch" id="voice-toggle-0" label=""
                                                className="m-0 d-flex align-items-center"
                                                style={{ transform: 'scale(0.65)', transformOrigin: 'right center' }}
                                                checked={voice1Enabled && availableVoices.includes(1)}
                                                disabled={isPlaying || !availableVoices.includes(1)}
                                                onChange={(e) => setVoice1Enabled(e.target.checked)} />
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between" style={{ width: '50px', height: '16px' }}>
                                            <span style={{ fontSize: '10px', color: voice2Enabled ? DARK_THEME.voice2Color : '#8892b0', fontWeight: 'bold' }}>V2</span>
                                            <Form.Check type="switch" id="voice-toggle-1" label=""
                                                className="m-0 d-flex align-items-center"
                                                style={{ transform: 'scale(0.65)', transformOrigin: 'right center' }}
                                                checked={voice2Enabled && availableVoices.includes(2)}
                                                disabled={isPlaying || !availableVoices.includes(2)}
                                                onChange={(e) => setVoice2Enabled(e.target.checked)} />
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between" style={{ width: '50px', height: '16px' }}>
                                            <span style={{ fontSize: '10px', color: metronomeEnabled ? DARK_THEME.metronomeControlMedium : '#8892b0', fontWeight: 'bold' }}>Met</span>
                                            <Form.Check type="switch" id="metronome-toggle" label=""
                                                className="m-0 d-flex align-items-center"
                                                style={{ transform: 'scale(0.65)', transformOrigin: 'right center' }}
                                                checked={metronomeEnabled} disabled={isPlaying}
                                                onChange={(e) => setMetronomeEnabled(e.target.checked)} />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-black px-2 py-1 rounded border border-secondary d-flex flex-column gap-1">
                                    <div style={{ fontSize: '8px', textTransform: 'uppercase', letterSpacing: '1px', color: '#586278' }}>Audio Tracks</div>
                                    <div className="d-flex align-items-center gap-1" style={{ height: '18px' }}>
                                        {['tab','both','sheet'].map(m => (
                                            <button key={m} onClick={() => !isPlaying && setViewMode(m)} disabled={isPlaying}
                                                style={{ fontSize: '9px', fontWeight: viewMode === m ? '700' : '400',
                                                    color: viewMode === m ? '#fff' : '#8892b0',
                                                    background: viewMode === m ? (m === 'tab' ? '#1a6b4a' : m === 'sheet' ? '#6b4a8a' : '#2a5a7a') : 'transparent',
                                                    border: `1px solid ${viewMode === m ? 'transparent' : '#3a3a5a'}`,
                                                    borderRadius: m === 'tab' ? '4px 0 0 4px' : m === 'sheet' ? '0 4px 4px 0' : '0',
                                                    padding: '0 7px', lineHeight: '16px', cursor: isPlaying ? 'default' : 'pointer',
                                                    opacity: isPlaying ? 0.5 : 1, transition: 'all 0.15s ease',
                                                    textTransform: 'uppercase', letterSpacing: '0.3px' }}
                                            >
                                                {m === 'tab' ? 'Tab' : m === 'both' ? 'Both' : 'Staff'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-black border border-secondary rounded p-2 font-monospace"
                            style={{ fontSize: '12px', lineHeight: '1.2', overflowY: 'auto', height: '74px' }}>
                            {activeDescription ? (
                                activeDescription
                            ) : trackStats ? (
                                <div className="d-flex flex-column" style={{ gap: '3px', color: '#8892b0' }}>
                                    <div style={{ fontSize: '8px', textTransform: 'uppercase', letterSpacing: '1px', color: '#586278' }}>Track Info</div>
                                    <div className="d-flex" style={{ gap: '8px', flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: '10px' }}><span style={{ color: '#64748b' }}>⌛</span> {trackStats.totalDuration}</span>
                                        <span style={{ fontSize: '10px' }}><span style={{ color: '#64748b' }}>♩</span> {trackStats.timeSig}</span>
                                        <span style={{ fontSize: '10px' }}><span style={{ color: '#64748b' }}>♯</span> {trackStats.keySig}</span>
                                        <span style={{ fontSize: '10px' }}><span style={{ color: '#64748b' }}>𝄆</span> {trackStats.totalMeasures} bars</span>
                                        <span style={{ fontSize: '10px' }}><span style={{ color: '#64748b' }}>♪</span> {trackStats.noteCount} notes</span>
                                        <span style={{ fontSize: '10px' }}><span style={{ color: '#64748b' }}>BPM</span> {trackStats.bpm}</span>
                                    </div>
                                </div>
                            ) : (
                                <span className="text-muted fst-italic" style={{ fontSize: '11px' }}>Select a note to view properties.</span>
                            )}
                        </div>
                    </div>
                ) : (
                    /* ----- Desktop: 3-column layout ----- */
                    <div className="d-flex gap-2" style={{ minHeight: '76px' }}>
                        <div className="d-flex flex-column gap-1" style={{ minWidth: '150px', flexShrink: 0 }}>
                            <div className="btn-group bg-black p-1 rounded border border-secondary" style={{ height: '30px', alignItems: 'center' }}>
                                {!isPlaying ? (
                                    <Button variant="link" onClick={startPlayback} className="text-success p-1" title="Start"
                                        disabled={!((voice1Enabled && availableVoices.includes(1)) || (voice2Enabled && availableVoices.includes(2)) || metronomeEnabled)}>
                                        <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                    </Button>
                                ) : isPaused ? (
                                    <Button variant="link" onClick={resumePlayback} className="text-warning p-1" title="Resume">
                                        <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                    </Button>
                                ) : (
                                    <Button variant="link" onClick={pausePlayback} className="text-warning p-1" title="Pause">
                                        <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                                    </Button>
                                )}
                                <Button variant="link" onClick={stopPlayback} disabled={!isPlaying} className={`p-1 ${isPlaying ? 'text-danger' : 'text-muted'}`} title="Stop">
                                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h12v12H6z" /></svg>
                                </Button>
                            </div>
                            <div className="bg-black px-2 py-1 rounded border border-secondary d-flex align-items-center" style={{ height: '26px' }}>
                                <Form.Range min="40" max="240" value={bpm}
                                    onChange={(e) => setBpm(parseInt(e.target.value, 10))}
                                    disabled={isPlaying} className="flex-grow-1" style={{ height: '5px' }} />
                                <span className="text-warning fw-bold font-monospace" style={{ fontSize: '9px', minWidth: '22px' }}>{bpm}</span>
                            </div>
                            <div className="bg-black px-1 rounded border border-secondary d-flex align-items-center" style={{ height: '12px' }}>
                                <div style={{ width: `${isPlaying && playbackProgress !== null ? playbackProgress : 0}%`, height: '4px',
                                    background: DARK_THEME.progressFill, borderRadius: '2px', transition: 'width 0.3s ease' }} />
                            </div>
                        </div>
                        <div className="d-flex flex-column gap-1" style={{ minWidth: '180px', flexShrink: 0 }}>
                                <div className="bg-black px-2 py-1 rounded border border-secondary d-flex flex-column gap-1">
                                    <div style={{ fontSize: '8px', textTransform: 'uppercase', letterSpacing: '1px', color: '#586278' }}>View Options</div>
                                <div className="d-flex align-items-center gap-2">
                                    <div className="d-flex align-items-center justify-content-between" style={{ width: '52px', height: '16px' }}>
                                        <span style={{ fontSize: '10px', color: voice1Enabled ? DARK_THEME.voice1Color : '#8892b0', fontWeight: 'bold' }}>V1</span>
                                        <Form.Check type="switch" id="voice-toggle-0" label=""
                                            className="m-0 d-flex align-items-center"
                                            style={{ transform: 'scale(0.7)', transformOrigin: 'right center' }}
                                            checked={voice1Enabled && availableVoices.includes(1)}
                                            disabled={isPlaying || !availableVoices.includes(1)}
                                            onChange={(e) => setVoice1Enabled(e.target.checked)} />
                                    </div>
                                    <div className="d-flex align-items-center justify-content-between" style={{ width: '52px', height: '16px' }}>
                                        <span style={{ fontSize: '10px', color: voice2Enabled ? DARK_THEME.voice2Color : '#8892b0', fontWeight: 'bold' }}>V2</span>
                                        <Form.Check type="switch" id="voice-toggle-1" label=""
                                            className="m-0 d-flex align-items-center"
                                            style={{ transform: 'scale(0.7)', transformOrigin: 'right center' }}
                                            checked={voice2Enabled && availableVoices.includes(2)}
                                            disabled={isPlaying || !availableVoices.includes(2)}
                                            onChange={(e) => setVoice2Enabled(e.target.checked)} />
                                    </div>
                                    <div className="d-flex align-items-center justify-content-between" style={{ width: '52px', height: '16px' }}>
                                        <span style={{ fontSize: '10px', color: metronomeEnabled ? DARK_THEME.metronomeControlMedium : '#8892b0', fontWeight: 'bold' }}>Met</span>
                                        <Form.Check type="switch" id="metronome-toggle" label=""
                                            className="m-0 d-flex align-items-center"
                                            style={{ transform: 'scale(0.7)', transformOrigin: 'right center' }}
                                            checked={metronomeEnabled} disabled={isPlaying}
                                            onChange={(e) => setMetronomeEnabled(e.target.checked)} />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-black px-2 py-1 rounded border border-secondary d-flex flex-column gap-1">
                                <div style={{ fontSize: '8px', textTransform: 'uppercase', letterSpacing: '1px', color: '#586278' }}>View Options</div>
                                <div className="d-flex align-items-center gap-1" style={{ height: '18px' }}>
                                    {['tab','both','sheet'].map(m => (
                                        <button key={m} onClick={() => !isPlaying && setViewMode(m)} disabled={isPlaying}
                                            style={{ fontSize: '9px', fontWeight: viewMode === m ? '700' : '400',
                                                color: viewMode === m ? '#fff' : '#8892b0',
                                                background: viewMode === m ? (m === 'tab' ? '#1a6b4a' : m === 'sheet' ? '#6b4a8a' : '#2a5a7a') : 'transparent',
                                                border: `1px solid ${viewMode === m ? 'transparent' : '#3a3a5a'}`,
                                                borderRadius: m === 'tab' ? '4px 0 0 4px' : m === 'sheet' ? '0 4px 4px 0' : '0',
                                                padding: '0 8px', lineHeight: '16px', cursor: isPlaying ? 'default' : 'pointer',
                                                opacity: isPlaying ? 0.5 : 1, transition: 'all 0.15s ease',
                                                textTransform: 'uppercase', letterSpacing: '0.3px' }}
                                        >
                                            {m === 'tab' ? 'Tab' : m === 'both' ? 'Both' : 'Staff'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="bg-black border border-secondary rounded p-2 font-monospace flex-grow-1 d-flex flex-column justify-content-center"
                            style={{ fontSize: '12px', lineHeight: '1.2', height: '76px', overflowY: 'auto' }}>
                            {activeDescription ? (
                                activeDescription
                            ) : trackStats ? (
                                <div className="d-flex flex-column" style={{ gap: '4px', color: '#8892b0' }}>
                                    <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px', color: '#586278', marginBottom: '2px' }}>Track Info</div>
                                    <div className="d-flex" style={{ gap: '12px', flexWrap: 'wrap' }}>
                                        <span><span style={{ color: '#64748b' }}>⌛</span> {trackStats.totalDuration}</span>
                                        <span><span style={{ color: '#64748b' }}>♩</span> {trackStats.timeSig}</span>
                                        <span><span style={{ color: '#64748b' }}>♯</span> {trackStats.keySig}</span>
                                        <span><span style={{ color: '#64748b' }}>𝄆</span> {trackStats.totalMeasures} bars</span>
                                        <span><span style={{ color: '#64748b' }}>♪</span> {trackStats.noteCount} notes</span>
                                        <span><span style={{ color: '#64748b' }}>BPM</span> {trackStats.bpm}</span>
                                    </div>
                                    <div style={{ fontSize: '10px', color: '#586278', marginTop: '2px' }}>
                                        Click any note on the score to inspect its properties.
                                    </div>
                                </div>
                            ) : (
                                <span className="text-muted fst-italic">Select a note to view properties.</span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* 3. THE TRUE SCROLL VIEWPORT: Only things inside this box will move or scroll */}
            <div
                ref={containerRef}
                className="flex-grow-1"
                style={{
                    overflowY: 'auto',
                    paddingTop: '12px',
                    paddingBottom: '150px',
                    position: 'relative'
                }}
            >
                <button
                    onClick={toggleFullscreen}
                    title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                    style={{
                        position: 'sticky',
                        top: isStackedLayout ? '4px' : '8px',
                        float: 'right',
                        zIndex: 10,
                        fontSize: isStackedLayout ? '9px' : '11px',
                        padding: isStackedLayout ? '2px 4px' : '4px 6px',
                        lineHeight: isStackedLayout ? '10px' : '14px',
                        color: isFullscreen ? '#22d3ee' : '#8892b0',
                        background: 'rgba(0,0,0,0.7)',
                        border: '1px solid #3a3a5a',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginRight: isStackedLayout ? '4px' : '8px',
                        transition: 'all 0.15s ease'
                    }}
                >
                    <svg width={isStackedLayout ? 10 : 14} height={isStackedLayout ? 10 : 14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d={isFullscreen ? "M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" : "M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"} />
                    </svg>
                </button>
                <Table responsive bordered={false} style={{ margin: 0, width: '100%' }}>
                    <tbody>
                        {computedRows.map((row, index) => {
                            const rowPaddingBottom = measuresPerRow === 1 ? '20px' : measuresPerRow === 2 ? '32px' : '48px';

                            return (
                                <tr key={index}>
                                    <td style={{ border: 0, padding: 0 }}>
                                        <div
                                            style={{
                                                background: 'rgba(255,255,255,0.015)',
                                                borderRadius: '6px',
                                                border: '1px solid rgba(255,255,255,0.04)',
                                                marginTop: index === 0 ? 0 : '24px',
                                                padding: `0 ${isStackedLayout ? '4px' : '12px'} ${rowPaddingBottom} ${isStackedLayout ? '4px' : '12px'}`,
                                            }}
                                        >
                                            {buildSvg(
                                                paddingX,
                                                trebleTopY,
                                                bassTopY,
                                                lineSpacing,
                                                timeSigTop,
                                                timeSigBottom,
                                                tabTopY,
                                                measureValidityMap,
                                                rhythmTopY,
                                                beatsPerMeasure,
                                                activeIndices,
                                                rhythm2TopY,
                                                rhythm1TopY,
                                                SLOT_WIDTH,
                                                isPlaying,
                                                isPaused,
                                                playbackIndex,
                                                () => {},
                                                handleNoteClick,
                                                measuresPerRow,
                                                voice1Enabled && availableVoices.includes(1),
                                                voice2Enabled && availableVoices.includes(2),
                                                metronomeEnabled,
                                                viewMode
                                            )(row, index)}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            </div>

                {countInBeat > 0 && (
                    <div
                        key={countInBeat}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100vw',
                            height: '100vh',
                            backgroundColor: 'rgba(0, 0, 0, 0.55)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 9999,
                            pointerEvents: 'none',
                        }}
                    >
                        <div
                            style={{
                                fontSize: '140px',
                                color: 'rgba(167, 139, 250, 0.95)',
                                fontWeight: 'bold',
                                fontFamily: 'monospace',
                                textShadow: '0 0 40px rgba(167, 139, 250, 0.5)',
                                animation: 'countin-fade 0.8s ease-out forwards',
                            }}
                        >
                            {countInBeat}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

