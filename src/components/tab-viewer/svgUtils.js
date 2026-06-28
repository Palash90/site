import { DARK_THEME, getFlagPath } from "./guitaleleViewerUtils";

export function buildSvg(paddingX, trebleTopY, bassTopY, lineSpacing, timeSigTop, timeSigBottom, tabTopY, measureValidityMap, rhythmTopY, beatsPerMeasure, activeIndices, rhythm2TopY, rhythm1TopY, SLOT_WIDTH, isPlaying, isPaused, playbackIndex, setHoveredNoteIndex, handleNoteClick, measuresPerRow, voice1Enabled, voice2Enabled, metronomeEnabled, viewMode) {
    return (
        {
            rowEvents, totalWidth, barlineXPositions, measureGroups, rowEndX
        },
        rowIdx
    ) => {
        // Determine the vertical scaling factor based on the responsive measures layout profile
        const scaleY = measuresPerRow === 1 ? 0.62 : measuresPerRow === 2 ? 0.78 : 1.0;
        const sLineSpacing = lineSpacing * scaleY;

        const showSheetMusic = viewMode !== 'tab';
        const showTab = viewMode !== 'sheet';

        const leftMargin = (paddingX - 105) * (measuresPerRow === 4 ? 1 : 0.85);

        // 1. Dynamically compute precise vertical bounds based on drawn elements
        const minY = (showSheetMusic ? (trebleTopY - 55) : (tabTopY - 15)) * scaleY;

        // Bottom-most elements are either the rhythm lane 2 background or the measure validity descriptions
        const maxRhythmY = (rhythmTopY + 80) * scaleY; // Covers rhythm text + background rect boundaries
        const maxValidityTextY = (tabTopY + (5 * lineSpacing) + 65) * scaleY; // Covers measure debug details
        const maxStaffY = (bassTopY + 4 * lineSpacing + 40) * scaleY; // Covers staff + ledger line area
        const maxY = showTab ? Math.max(maxRhythmY, maxValidityTextY) : maxStaffY;

        // Calculate the exact height needed to fit everything snugly
        const calculatedHeight = maxY - minY;

        const fretFontSize = 16 * scaleY + 'px';
        const activePlaybackEvent = rowEvents.find(
            ev => ev.globalIndex === playbackIndex
        );

        // Compute rect positions based on showSheetMusic to keep them within the visible viewBox
        const highlightY = (showSheetMusic ? (trebleTopY - 50) : (tabTopY - 15)) * scaleY;
        const highlightH = (showSheetMusic
            ? (showTab
                ? (rhythmTopY - trebleTopY + 95)
                : (bassTopY + 4 * lineSpacing + 70 - trebleTopY))
            : (rhythmTopY - tabTopY + 60)) * scaleY;
        const hitTestY = (showSheetMusic ? (trebleTopY - 15) : (tabTopY - 15)) * scaleY;
        const hitTestH = (showSheetMusic
            ? (showTab
                ? (rhythmTopY - trebleTopY + 65)
                : (bassTopY + 4 * lineSpacing + 35 - trebleTopY))
            : (rhythmTopY - tabTopY + 65)) * scaleY;

        return (
            <div
                key={`row-${rowIdx}`}
                className={`${DARK_THEME.bgScore} ${DARK_THEME.borderScore} rounded-lg shadow-xl p-4 w-full overflow-x-auto flex justify-start md:justify-center`}
            >
                <svg
                    // 2. Adjust viewBox to start exactly where content begins and end exactly where it finishes
                    viewBox={`0 ${minY} ${totalWidth} ${calculatedHeight}`}
                    style={{
                        width: `${totalWidth}px`,
                        maxWidth: "100%",
                        height: "auto",
                        maxHeight: "none"
                    }}
                    className="select-none block shrink-0"
                >
                    <defs>
                        <pattern id={`grid-${rowIdx}`} width="24" height="24" patternUnits="userSpaceOnUse">
                            <path d="M 24 0 L 0 0 0 24" fill="none" stroke={DARK_THEME.gridStroke} strokeWidth="0.5" />
                            <path d="M 48 0 L 0 0 0 48" fill="none" stroke={DARK_THEME.gridStrokeStrong} strokeWidth="0.5" />
                        </pattern>
                        <filter
                            id="note-glow"
                            filterUnits="userSpaceOnUse"
                            x="-20"
                            y={minY - 20 * scaleY}
                            width={totalWidth + 40}
                            height={maxY - minY + 40 * scaleY}
                        >
                            <feGaussianBlur
                                stdDeviation="2"
                                result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Faint background grid for spatial reference */}
                    <rect
                        x={0}
                        y={minY}
                        width={totalWidth}
                        height={maxY - minY + 10}
                        fill={`url(#grid-${rowIdx})`}
                        pointerEvents="none"
                    />

                    {/* Playhead sweep line during playback */}
                    {isPlaying && !isPaused && activePlaybackEvent && (
                        <line
                            x1={activePlaybackEvent.cx}
                            y1={minY}
                            x2={activePlaybackEvent.cx}
                            y2={maxY}
                            stroke={DARK_THEME.progressFill}
                            strokeWidth="1.5"
                            opacity="0.4"
                            strokeDasharray="3 5"
                            pointerEvents="none"
                        />
                    )}

                    {metronomeEnabled && (showSheetMusic || showTab) && (
                        <g id="metronome-tick-layer" pointerEvents="none">
                            {rowEvents
                                .filter(ev => ev.isMetronomeTick)
                                .map((ev, mIdx) => {
                                    const isActiveMetronomeTick =
                                        isPlaying &&
                                        !isPaused &&
                                        activePlaybackEvent &&
                                        activePlaybackEvent.measureNumber === ev.measureNumber &&
                                        activePlaybackEvent.startBeat === ev.startBeat;

                                    return (
                                        <line
                                            key={`metro-tick-${mIdx}`}
                                            x1={ev.cx}
                                            y1={(trebleTopY - 30) * scaleY}
                                            x2={ev.cx + 0.01} // Keep the filter mobile-fix clip tweak
                                            y2={showTab ? (rhythmTopY - 50) * scaleY : (bassTopY + 4 * lineSpacing + 10) * scaleY}
                                            stroke={ev.isDownbeat ? DARK_THEME.metronomeDownBeat : DARK_THEME.metronomeUpBeat}
                                            strokeWidth={isActiveMetronomeTick ? "3" : ev.isDownbeat ? "2" : "1.5"}
                                            strokeDasharray="4 4"
                                            opacity={isActiveMetronomeTick ? "1" : ev.isDownbeat ? "0.7" : "0.4"}
                                            filter={isActiveMetronomeTick ? "url(#note-glow)" : "none"}
                                        />
                                    );
                                })}
                        </g>
                    )}

                    <path
                        d={`M ${paddingX - 115} ${trebleTopY * scaleY} L ${paddingX - 122} ${trebleTopY * scaleY} L ${paddingX - 122} ${(bassTopY + 4 * lineSpacing) * scaleY} L ${paddingX - 115} ${(bassTopY + 4 * lineSpacing) * scaleY}`}
                        fill="none"
                        stroke={DARK_THEME.lineStaff}
                        strokeWidth="2.5" />

                    {showSheetMusic && <>
                        {[0, 1, 2, 3, 4].map(i => (
                            <line
                                key={`treble-${i}`}
                                x1={paddingX - 40 * (measuresPerRow === 4 ? 0.7 : measuresPerRow === 2 ? 0.8 : 0.9)}
                                y1={(trebleTopY * scaleY) + i * sLineSpacing}
                                x2={rowEndX}
                                y2={(trebleTopY * scaleY) + i * sLineSpacing}
                                stroke={DARK_THEME.lineStaff}
                                strokeWidth="1.6" />
                        ))}
                        <text
                            x={leftMargin}
                            y={(trebleTopY * scaleY) + 3.5 * sLineSpacing}
                            style={{ fontSize: `${48 * scaleY}px` }}
                            fill={DARK_THEME.textClef}
                        >
                            𝄞
                        </text>

                        {[0, 1, 2, 3, 4].map(i => (
                            <line
                                key={`bass-${i}`}
                                x1={paddingX - 40 * (measuresPerRow === 4 ? 0.7 : measuresPerRow === 2 ? 0.8 : 0.9)}
                                y1={(bassTopY * scaleY) + i * sLineSpacing}
                                x2={rowEndX}
                                y2={(bassTopY * scaleY) + i * sLineSpacing}
                                stroke={DARK_THEME.lineStaff}
                                strokeWidth="1" />
                        ))}
                        <text
                            x={leftMargin}
                            y={(bassTopY * scaleY) + 3.2 * sLineSpacing}
                            style={{ fontSize: `${48 * scaleY}px` }}
                            fill={DARK_THEME.textClef}
                        >
                            𝄢
                        </text>
                    </>}

                    <g
                        className="font-serif font-black text-2xl text-center"
                        fill={DARK_THEME.textTimeSig}
                        transform={`translate(${paddingX - (90 * (measuresPerRow === 4 ? 0.7 : measuresPerRow === 2 ? 0.8 : 0.9))}, 0)`}
                    >
                        {showSheetMusic && <>
                            <text
                                x="0"
                                y={(trebleTopY * scaleY) + 1.35 * sLineSpacing}
                                textAnchor="middle"
                            >
                                {timeSigTop}
                            </text>
                            <text
                                x="0"
                                y={(trebleTopY * scaleY) + 3.35 * sLineSpacing}
                                textAnchor="middle"
                            >
                                {timeSigBottom}
                            </text>
                            <text
                                x="0"
                                y={(bassTopY * scaleY) + 1.35 * sLineSpacing}
                                textAnchor="middle"
                            >
                                {timeSigTop}
                            </text>
                            <text
                                x="0"
                                y={(bassTopY * scaleY) + 3.35 * sLineSpacing}
                                textAnchor="middle"
                            >
                                {timeSigBottom}
                            </text>
                        </>}
                        {showTab && <>
                            <text
                                x="0"
                                y={(tabTopY * scaleY) + 1.6 * sLineSpacing}
                                textAnchor="middle"
                                className="text-xl font-sans font-bold"
                                fill={DARK_THEME.textTabLabel}
                            >
                                {timeSigTop}
                            </text>
                            <text
                                x="0"
                                y={(tabTopY * scaleY) + 4.1 * sLineSpacing}
                                textAnchor="middle"
                                className="text-xl font-sans font-bold"
                                fill={DARK_THEME.textTabLabel}
                            >
                                {timeSigBottom}
                            </text>
                        </>}
                    </g>

                    {showTab && [0, 1, 2, 3, 4, 5].map(i => (
                        <line
                            key={`t-l-${i}`}
                            x1={paddingX - 40 * (measuresPerRow === 4 ? 0.7 : measuresPerRow === 2 ? 0.8 : 0.9)}
                            y1={(tabTopY * scaleY) + i * sLineSpacing}
                            x2={rowEndX}
                            y2={(tabTopY * scaleY) + i * sLineSpacing}
                            stroke={DARK_THEME.lineTab}
                            strokeWidth="2" />
                    ))}
                    {showTab && (
                        <g
                            transform={`translate(${leftMargin}, ${(tabTopY * scaleY) + 36 * scaleY})`}
                            fill={DARK_THEME.textTabLabel}
                            style={{ fontSize: `${36 * scaleY}px`, fontWeight: "900", letterSpacing: "-0.1em" }}
                        >
                            <text x="0" y="0">T</text>
                            <text x="0" y={36 * scaleY}>A</text>
                            <text x="0" y={72 * scaleY}>B</text>
                        </g>
                    )}
                    {showTab && [0, 1, 2, 3, 4, 5].map(i => (
                        <text
                            key={`string-${i}`}
                            x={paddingX - (60 * (measuresPerRow === 4 ? 0.7 : measuresPerRow === 2 ? 0.8 : 0.9))}
                            y={(tabTopY * scaleY) + i * sLineSpacing + 4 * scaleY}
                            textAnchor="end"
                            fill={DARK_THEME.textTabString}
                            style={{ fontSize: `${14 * scaleY}px`, fontWeight: "bold" }}
                        >
                            {i + 1}
                        </text>
                    ))}

                    <line
                        x1={paddingX - 40 * (measuresPerRow === 4 ? 0.7 : measuresPerRow === 2 ? 0.8 : 0.9)}
                        y1={trebleTopY * scaleY}
                        x2={paddingX - 40 * (measuresPerRow === 4 ? 0.7 : measuresPerRow === 2 ? 0.8 : 0.9)}
                        y2={(bassTopY + 4 * lineSpacing) * scaleY}
                        stroke={DARK_THEME.lineBar}
                        strokeWidth="2" />
                    {showTab && (
                        <line
                            x1={paddingX - 40 * (measuresPerRow === 4 ? 0.7 : measuresPerRow === 2 ? 0.8 : 0.9)}
                            y1={tabTopY * scaleY}
                            x2={paddingX - 40 * (measuresPerRow === 4 ? 0.7 : measuresPerRow === 2 ? 0.8 : 0.9)}
                            y2={(tabTopY + 5 * lineSpacing) * scaleY}
                            stroke={DARK_THEME.lineTab}
                            strokeWidth="2" />
                    )}

                    {barlineXPositions.map((barX, i) => (
                        <g key={`barline-${i}`}>
                            {showSheetMusic && (
                                <line
                                    x1={barX}
                                    y1={trebleTopY * scaleY}
                                    x2={barX}
                                    y2={(bassTopY + 4 * lineSpacing) * scaleY}
                                    stroke={DARK_THEME.lineBar}
                                    strokeWidth={i ===
                                        barlineXPositions.length - 1
                                        ? "2"
                                        : "1.6"} />
                            )}
                            {showTab && (
                                <line
                                    x1={barX}
                                    y1={tabTopY * scaleY}
                                    x2={barX}
                                    y2={(tabTopY + 5 * lineSpacing) * scaleY}
                                    stroke={DARK_THEME.lineTab}
                                    strokeWidth={i ===
                                        barlineXPositions.length - 1
                                        ? "2"
                                        : "1.6"} />
                            )}
                        </g>
                    ))}

                    {measureGroups.map(measure => {
                        const measureCenterX = (measure.startX + measure.endX) / 2;
                        const mv = measureValidityMap?.[measure.measureNumber];

                        const isMeasureInvalid = mv && (!mv.valid1 || !mv.valid2);

                        return (
                            <g
                                key={`measure-${measure.measureNumber}`}
                            >
                                {isMeasureInvalid && showTab && (
                                    <rect
                                        x={measure.startX}
                                        y={(showSheetMusic ? (trebleTopY - 40) : (tabTopY - 15)) * scaleY}
                                        width={measure.endX -
                                            measure.startX}
                                        height={(showSheetMusic
                                            ? (showTab
                                                ? (rhythmTopY - trebleTopY + 85)
                                                : (bassTopY + 4 * lineSpacing + 45 - trebleTopY))
                                            : (rhythmTopY - tabTopY + 60)) * scaleY}
                                        fill={DARK_THEME.bgInvalidMeasure}
                                        stroke="rgba(239, 68, 68, 0.4)"
                                        strokeWidth="1.5"
                                        rx={6} />
                                )}

                                {showTab && (
                                    <text
                                        x={measureCenterX}
                                        y={(tabTopY +
                                            5 * lineSpacing +
                                            32) * scaleY}
                                        textAnchor="middle"
                                        className="text-[10px] font-mono font-bold"
                                        fill={isMeasureInvalid
                                            ? "#f87171"
                                            : DARK_THEME.textTabString}
                                    >
                                        M{measure.measureNumber}{" "}
                                        {isMeasureInvalid
                                            ? "⚠️"
                                            : ""}
                                    </text>
                                )}

                                {showTab && isMeasureInvalid &&
                                    mv &&
                                    (() => {
                                        const pieces = [];

                                        if (mv.present1 &&
                                            !mv.valid1) {
                                            pieces.push(
                                                `v1:${Number(mv.sum1).toFixed(2)}/${beatsPerMeasure}`
                                            );
                                        }

                                        if (mv.present2 &&
                                            !mv.valid2) {
                                            pieces.push(
                                                `v2:${Number(mv.sum2).toFixed(2)}/${beatsPerMeasure}`
                                            );
                                        }

                                        return (
                                            <text
                                                x={measureCenterX}
                                                y={(tabTopY +
                                                    5 *
                                                    lineSpacing +
                                                    48) * scaleY}
                                                textAnchor="middle"
                                                className="text-[10px] font-mono font-semibold"
                                                fill="#f87171"
                                            >
                                                {pieces.join(
                                                    " "
                                                )}
                                            </text>
                                        );
                                    })()}
                            </g>
                        );
                    })}

                    {rowEvents.map((ev, idx) => {
                        const isExplicitlyActive = activeIndices.includes(ev.globalIndex);

                        const isNoteCurrentlySustaining =
                            isPlaying &&
                            activePlaybackEvent &&
                            activePlaybackEvent.measureNumber === ev.measureNumber &&
                            activePlaybackEvent.startBeat >= ev.startBeat &&
                            activePlaybackEvent.startBeat < (ev.startBeat + (ev.beatValue || 1.0));


                        const isTiedToSustaining = ev.isTiedToNext && (() => {
                            const nextEv = rowEvents
                                .slice(idx + 1)
                                .find(e => e.voice === ev.voice && !e.isRest);
                            if (!nextEv) return false;

                            return activeIndices.includes(nextEv.globalIndex) ||
                                (isPlaying && activePlaybackEvent &&
                                    activePlaybackEvent.measureNumber === nextEv.measureNumber &&
                                    activePlaybackEvent.startBeat >= nextEv.startBeat &&
                                    activePlaybackEvent.startBeat < (nextEv.startBeat + (nextEv.beatValue || 1.0)));
                        })();

                        const isActive = isExplicitlyActive || isNoteCurrentlySustaining || isTiedToSustaining;

                        let highlightOpacity = 0;
                        if (isExplicitlyActive) {
                            highlightOpacity = 1.0; // Full brightness when strictly active
                        } else if (isNoteCurrentlySustaining) {
                            const elapsed = activePlaybackEvent.startBeat - ev.startBeat;
                            const duration = ev.beatValue || 1.0;
                            // Fades smoothly down from 0.70 to an elegant 0.15 across its beat value duration
                            highlightOpacity = Math.max(0.15, 0.70 * (1 - (elapsed / duration)));
                        } else if (isTiedToSustaining) {
                            highlightOpacity = 0.25; // Gentle persistent holding glow for old tied roots
                        }

                        const isPrimaryHighlightNode = isActive && (activeIndices[0] === ev.globalIndex || isNoteCurrentlySustaining);
                        const currentNoteFill = isActive ? DARK_THEME.fillNoteHover : DARK_THEME.fillNote;

                        const yLane = (ev.voice === 2 ? rhythm2TopY : rhythm1TopY) * scaleY;
                        const restTabOffset = (ev.voice === 2 ? 16 : -16) * scaleY;
                        const isMuted = (ev.voice === 1 && !voice1Enabled) || (ev.voice === 2 && !voice2Enabled);

                        const isActiveMetronomeTick = ev.isMetronomeTick &&
                            metronomeEnabled &&
                            isPlaying &&
                            !isPaused &&
                            activePlaybackEvent &&
                            activePlaybackEvent.measureNumber === ev.measureNumber &&
                            activePlaybackEvent.startBeat === ev.startBeat;

                        return (
                            <g key={`node-${idx}`}>
                                {isActive && (
                                    <rect
                                        data-active-indicator="true"
                                        x={ev.cx - SLOT_WIDTH / 2 + 2}
                                        y={highlightY}
                                        width={SLOT_WIDTH - 4}
                                        height={highlightH}
                                        fill={isExplicitlyActive ? DARK_THEME.fillHoverHighlight : DARK_THEME.sustainedNoteHighlight}
                                        opacity={highlightOpacity} // Apply the timed decay factor here
                                        rx={4}
                                        filter={isNoteCurrentlySustaining || isTiedToSustaining ? "url(#note-glow)" : "none"}
                                        style={{ transition: "fill 0.2s ease" }}
                                    />

                                )}

                                {isPrimaryHighlightNode && (
                                    <rect
                                        data-active-indicator="true"
                                        x={ev.cx - SLOT_WIDTH / 2 + 2}
                                        y={highlightY}
                                        width={SLOT_WIDTH - 4}
                                        height={highlightH}
                                        fill={DARK_THEME.fillHoverHighlight}
                                        opacity={highlightOpacity}
                                        rx={4} />
                                )}

                                {isPaused && playbackIndex === ev.globalIndex && !ev.isMetronomeTick && (
                                    <rect
                                        data-paused-indicator="true"
                                        x={ev.cx - SLOT_WIDTH / 2 + 2}
                                        y={highlightY}
                                        width={SLOT_WIDTH - 4}
                                        height={highlightH}
                                        fill="none"
                                        stroke={DARK_THEME.textTabNumberHover}
                                        strokeDasharray="5 4"
                                        strokeWidth={1.6}
                                        rx={4}
                                        pointerEvents="none" />
                                )}

                                {/* Ripple effect on user-tapped notes */}
                                {isExplicitlyActive && !isPlaying && (
                                    <g pointerEvents="none">
                                        <circle cx={ev.cx} cy={highlightY + highlightH / 2} r="6" fill="none" stroke={DARK_THEME.rippleStroke} strokeWidth="2">
                                            <animate attributeName="r" values="6;32" dur="1s" repeatCount="indefinite" />
                                            <animate attributeName="opacity" values="0.6;0" dur="1s" repeatCount="indefinite" />
                                            <animate attributeName="stroke-width" values="2.5;0.5" dur="1s" repeatCount="indefinite" />
                                        </circle>
                                        <circle cx={ev.cx} cy={highlightY + highlightH / 2} r="6" fill={DARK_THEME.rippleColor}>
                                            <animate attributeName="r" values="6;20" dur="1s" repeatCount="indefinite" />
                                            <animate attributeName="opacity" values="0.35;0" dur="1s" repeatCount="indefinite" />
                                        </circle>
                                    </g>
                                )}

                                {ev.isRest ? (
                                    <g style={{ opacity: isMuted ? 0.4 : 1 }}>
                                        {showSheetMusic && <>
                                            {ev.beatValue === 4.0 ? (
                                                <rect
                                                    x={ev.cx - 7}
                                                    y={(trebleTopY * scaleY) + 1 * sLineSpacing - (sLineSpacing * 0.05)}
                                                    width={14}
                                                    height={sLineSpacing * 0.6}
                                                    fill={DARK_THEME.fillRest}
                                                    rx={1} />
                                            ) : ev.beatValue === 2.0 ? (
                                                <rect
                                                    x={ev.cx - 7}
                                                    y={(trebleTopY * scaleY) + 2 * sLineSpacing + (sLineSpacing * 0.4)}
                                                    width={14}
                                                    height={sLineSpacing * 0.6}
                                                    fill={DARK_THEME.fillRest}
                                                    rx={1} />
                                            ) : (
                                                <>
                                                    {ev.rhythm === "r" && (
                                                        <path
                                                            d={`M ${ev.cx - 4} ${(trebleTopY + 28) * scaleY} L ${ev.cx + 4} ${(trebleTopY + 34) * scaleY} L ${ev.cx - 4} ${(trebleTopY + 40) * scaleY} Q ${ev.cx + 6} ${(trebleTopY + 44) * scaleY} ${ev.cx} ${(trebleTopY + 50) * scaleY}`}
                                                            fill="none"
                                                            stroke={DARK_THEME.fillRest}
                                                            strokeWidth="2"
                                                            strokeLinecap="round" />
                                                    )}
                                                    {ev.rhythm === "r+" && (
                                                        <path
                                                            d={`M ${ev.cx - 3} ${(trebleTopY + 32) * scaleY} A 3.5 3.5 0 1 1 ${ev.cx + 2} ${(trebleTopY + 34) * scaleY} Q ${ev.cx - 2} ${(trebleTopY + 38) * scaleY} ${ev.cx + 4} ${(trebleTopY + 30) * scaleY} L ${ev.cx - 3} ${(trebleTopY + 50) * scaleY}`}
                                                            fill="none"
                                                            stroke={DARK_THEME.fillRest}
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round" />
                                                    )}
                                                    {ev.rhythm === "r=" && (
                                                        <g>
                                                            <path
                                                                d={`M ${ev.cx - 2} ${(trebleTopY + 27) * scaleY} A 3 3 0 1 1 ${ev.cx + 3} ${(trebleTopY + 29) * scaleY} Q ${ev.cx - 1} ${(trebleTopY + 33) * scaleY} ${ev.cx + 5} ${(trebleTopY + 25) * scaleY}`}
                                                                fill="none"
                                                                stroke={DARK_THEME.fillRest}
                                                                strokeWidth="2" />
                                                            <path
                                                                d={`M ${ev.cx - 4} ${(trebleTopY + 36) * scaleY} A 3 3 0 1 1 ${ev.cx + 1} ${(trebleTopY + 38) * scaleY} Q ${ev.cx - 3} ${(trebleTopY + 42) * scaleY} ${ev.cx + 3} ${(trebleTopY + 34) * scaleY} L ${ev.cx - 4} ${(trebleTopY + 52) * scaleY}`}
                                                                fill="none"
                                                                stroke={DARK_THEME.fillRest}
                                                                strokeWidth="2"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round" />
                                                        </g>
                                                    )}
                                                </>
                                            )}
                                        </>}



                                        {showTab && (
                                            <rect
                                                x={ev.cx - 8}
                                                y={(tabTopY + 2 * lineSpacing - 4) * scaleY + restTabOffset}
                                                width={19}
                                                height={20 * scaleY}
                                                fill={DARK_THEME.bgTabRect} />
                                        )}
                                        {showTab && (
                                            <text
                                                x={ev.cx}
                                                y={(tabTopY + 3 * lineSpacing - 6) * scaleY + restTabOffset}
                                                textAnchor="middle"
                                                className="text-lg font-mono font-bold"
                                                fill={DARK_THEME.fillRest}
                                            >
                                                𝄾
                                            </text>
                                        )}
                                    </g>
                                ) : (
                                    <g>
                                        {ev.processedPitches.map(
                                            (pitch, pIdx) => {
                                                const clefTopY = pitch.clef === "treble" ? trebleTopY : bassTopY;
                                                const bottomStaffEdge = clefTopY + 4 * lineSpacing;
                                                const lowerLedgers = pitch.staffY > bottomStaffEdge ? Math.floor((pitch.staffY - bottomStaffEdge) / lineSpacing) : 0;
                                                const upperLedgers = pitch.staffY <
                                                    clefTopY
                                                    ? Math.floor(
                                                        (clefTopY -
                                                            pitch.staffY) /
                                                        lineSpacing
                                                    )
                                                    : 0;

                                                const voiceColor = ev.voice === 2 ? DARK_THEME.voice2Color : DARK_THEME.voice1Color;
                                                const activeNoteColor = isMuted ? DARK_THEME.inactiveVoiceColor : (isActive ? voiceColor : DARK_THEME.fillNote);
                                                const activeStrokeColor = isMuted ? DARK_THEME.inactiveVoiceColor : (isActive ? voiceColor : DARK_THEME.fillNote);
                                                const glowFilter = (isActive && !isMuted) ? "url(#note-glow)" : "none";

                                                const currentStaffY = pitch.staffY * scaleY;
                                                const currentTabY = pitch.tabY * scaleY;

                                                return (
                                                    <g
                                                        key={`p-${pIdx}`}
                                                    >
                                                        {showSheetMusic && <>
                                                            {pitch.isSharp && (
                                                                <text
                                                                    x={ev.cx - 18}
                                                                    y={currentStaffY + 5 * scaleY}
                                                                    className="text-base font-normal font-serif"
                                                                    fill={activeStrokeColor}
                                                                    filter={glowFilter}
                                                                >
                                                                    ♯
                                                                </text>
                                                            )}

                                                            {Array.from(
                                                                {
                                                                    length: Math.max(0, upperLedgers)
                                                                }
                                                            ).map((_, lIdx) => (
                                                                <line
                                                                    key={`up-ledg-${lIdx}`}
                                                                    x1={ev.cx - 14}
                                                                    y1={(clefTopY * scaleY) - (lIdx + 1) * sLineSpacing}
                                                                    x2={ev.cx + 14}
                                                                    y2={(clefTopY * scaleY) - (lIdx + 1) * sLineSpacing}
                                                                    stroke={DARK_THEME.lineStaff}
                                                                    strokeWidth="1.2" />
                                                            )
                                                            )}
                                                            {Array.from(
                                                                {
                                                                    length: Math.max(0, lowerLedgers)
                                                                }
                                                            ).map(
                                                                (_, lIdx) => (
                                                                    <line
                                                                        key={`low-ledg-${lIdx}`}
                                                                        x1={ev.cx - 14}
                                                                        y1={(bottomStaffEdge * scaleY) + (lIdx + 1) * sLineSpacing}
                                                                        x2={ev.cx + 14}
                                                                        y2={(bottomStaffEdge * scaleY) + (lIdx + 1) * sLineSpacing}
                                                                        stroke={DARK_THEME.lineStaff}
                                                                        strokeWidth="1.2" />
                                                                )
                                                            )}

                                                            {pitch.fret ===
                                                                null ? (
                                                                <g>
                                                                    <line
                                                                        x1={ev.cx - 6}
                                                                        y1={currentStaffY - 6 * scaleY}
                                                                        x2={ev.cx + 6}
                                                                        y2={currentStaffY + 6 * scaleY}
                                                                        stroke={activeStrokeColor}
                                                                        strokeWidth="1.8"
                                                                        strokeLinecap="round" />
                                                                    <line
                                                                        x1={ev.cx - 6}
                                                                        y1={currentStaffY + 6 * scaleY}
                                                                        x2={ev.cx + 6}
                                                                        y2={currentStaffY - 6 * scaleY}
                                                                        stroke={activeStrokeColor}
                                                                        strokeWidth="1.8"
                                                                        strokeLinecap="round" />
                                                                </g>
                                                            ) : ev.beatValue >= 2.0 ? (
                                                                <ellipse
                                                                    cx={ev.cx}
                                                                    cy={currentStaffY}
                                                                    rx={6}
                                                                    ry={4 * scaleY}
                                                                    transform={`rotate(-22 ${ev.cx} ${currentStaffY})`}
                                                                    fill="none"
                                                                    stroke={activeStrokeColor}
                                                                    strokeWidth="2.2"
                                                                    filter={glowFilter} />
                                                            ) : (
                                                                <ellipse
                                                                    cx={ev.cx}
                                                                    cy={currentStaffY}
                                                                    rx={6}
                                                                    ry={4 * scaleY}
                                                                    transform={`rotate(-22 ${ev.cx} ${currentStaffY})`}
                                                                    fill={activeNoteColor}
                                                                    filter={glowFilter} />
                                                            )}

                                                            {ev.isTiedToNext &&
                                                                pitch.fret !==
                                                                null &&
                                                                (() => {
                                                                    const nextEv = rowEvents
                                                                        .slice(idx + 1)
                                                                        .find(e => e.voice === ev.voice && !e.isRest);
                                                                    if (!nextEv)
                                                                        return null;
                                                                    const targetPitch = nextEv.processedPitches.find(
                                                                        np => np.string ===
                                                                            pitch.string
                                                                    ) ||
                                                                        nextEv
                                                                            .processedPitches[0];
                                                                    if (targetPitch &&
                                                                        targetPitch.fret !==
                                                                        null) {
                                                                        return (
                                                                            <path
                                                                                d={`M ${ev.cx + 4} ${currentStaffY + 5 * scaleY} Q ${(ev.cx + nextEv.cx) / 2} ${(Math.max(pitch.staffY, targetPitch.staffY) * scaleY) + 16 * scaleY} ${nextEv.cx - 4} ${(targetPitch.staffY * scaleY) + 5 * scaleY}`}
                                                                                fill="none"
                                                                                stroke={DARK_THEME.lineTie}
                                                                                strokeWidth="1.8"
                                                                                strokeLinecap="round" />
                                                                        );
                                                                    }
                                                                    return null;
                                                                })()}
                                                        </>}

                                                        {showTab && ev.isTiedToNext &&
                                                            pitch.fret !== null &&
                                                            (() => {
                                                                const nextEv = rowEvents
                                                                    .slice(idx + 1)
                                                                    .find(e => e.voice === ev.voice && !e.isRest);
                                                                if (!nextEv)
                                                                    return null;

                                                                const targetPitch = nextEv.processedPitches.find(np => np.string === pitch.string);
                                                                if (!targetPitch || targetPitch.fret === null)
                                                                    return null;

                                                                const isTieActive = !isMuted && (
                                                                    activeIndices.includes(ev.globalIndex) ||
                                                                    activeIndices.includes(nextEv.globalIndex) ||
                                                                    isNoteCurrentlySustaining ||
                                                                    isTiedToSustaining
                                                                );

                                                                const tieStrokeColor = isTieActive ? ev.voice === 2 ? DARK_THEME.voice2Color : DARK_THEME.voice1Color : DARK_THEME.lineTie;
                                                                const tieGlow = isTieActive ? "url(#note-glow)" : "none";

                                                                if (targetPitch.midi ===
                                                                    pitch.midi) {
                                                                    return (
                                                                        <path
                                                                            d={`M ${ev.cx + 4} ${currentTabY} Q ${(ev.cx + nextEv.cx) / 2} ${currentTabY + 12 * scaleY} ${nextEv.cx - 4} ${targetPitch.tabY * scaleY}`}
                                                                            fill="none"
                                                                            stroke={tieStrokeColor}
                                                                            strokeWidth={isTieActive ? "2.5" : "1.8"}
                                                                            strokeLinecap="round"
                                                                            filter={tieGlow} />
                                                                    );
                                                                } else {
                                                                    return (
                                                                        <line
                                                                            x1={ev.cx + 12}
                                                                            y1={currentTabY}
                                                                            x2={nextEv.cx - 12}
                                                                            y2={targetPitch.tabY * scaleY}
                                                                            stroke={tieStrokeColor}
                                                                            strokeWidth={isTieActive ? "3" : "2"}
                                                                            strokeLinecap="round"
                                                                            filter={tieGlow} />
                                                                    );
                                                                }
                                                            })()}

                                                        {showTab && (
                                                            <rect
                                                                x={ev.cx - 13}
                                                                y={currentTabY - 11 * scaleY}
                                                                width={20}
                                                                height={18 * scaleY}
                                                                fill="#0f172a"
                                                                stroke={activeStrokeColor}
                                                                strokeWidth={isActive ? "2" : "1.5"}
                                                                filter={glowFilter}
                                                                rx={3} />
                                                        )}

                                                        {showTab && (
                                                            <text
                                                                x={ev.cx - 3}
                                                                y={currentTabY + 3.2 * scaleY}
                                                                textAnchor="middle"
                                                                className="font-sans tracking-wide"
                                                                style={{ fontSize: fretFontSize, fontWeight: "600" }}
                                                                fill={
                                                                    isMuted ? DARK_THEME.inactiveVoiceColor
                                                                        : (isActive
                                                                            ? DARK_THEME.textTabNumberHover
                                                                            : DARK_THEME.textTabNumber)}
                                                            >
                                                                {pitch.fret === null ? "X" : pitch.fret}
                                                            </text>
                                                        )}
                                                    </g>
                                                );
                                            }
                                        )}

                                        {showSheetMusic && <>
                                            {ev.trebleStem &&
                                                ev.beatValue <
                                                4.0 &&
                                                (() => {
                                                    const voiceColor = ev.voice === 2 ? DARK_THEME.voice2Color : DARK_THEME.voice1Color;
                                                    const activeStrokeColor = isMuted ? DARK_THEME.inactiveVoiceColor : (!isActive ? DARK_THEME.fillNote : voiceColor);
                                                    const glowFilter = (isActive && !isMuted) ? "url(#note-glow)" : "none";

                                                    const { lowestY, highestY, stemDown } = ev.trebleStem;
                                                    const xPos = stemDown ? ev.cx - 5.5 : ev.cx + 5.5;
                                                    const extY = stemDown ? (lowestY * scaleY) + 28 * scaleY : (highestY * scaleY) - 28 * scaleY;
                                                    const numFlags = ev.beatValue <= 0.25 ? 2 : ev.beatValue <= 0.75 ? 1 : 0;

                                                    return (
                                                        <g>
                                                            <line
                                                                x1={xPos}
                                                                y1={highestY * scaleY}
                                                                x2={xPos}
                                                                y2={extY}
                                                                stroke={activeStrokeColor}
                                                                strokeWidth="1.6" />
                                                            {numFlags >
                                                                0 && (
                                                                    <path
                                                                        d={getFlagPath(xPos, extY, stemDown, numFlags)}
                                                                        fill={activeStrokeColor} />
                                                                )}
                                                        </g>
                                                    );
                                                })()}

                                            {ev.bassStem && ev.beatValue < 4.0 &&
                                                (() => {
                                                    const voiceColor = ev.voice === 2 ? DARK_THEME.voice2Color : DARK_THEME.voice1Color;
                                                    const activeStrokeColor = isMuted ? DARK_THEME.inactiveVoiceColor : (isActive ? voiceColor : DARK_THEME.fillNote);
                                                    const glowFilter = isActive && !isMuted ? "url(#note-glow)" : "none";

                                                    const { lowestY, highestY, stemDown } = ev.bassStem;
                                                    const xPos = stemDown ? ev.cx - 5.5 : ev.cx + 5.5;
                                                    const extY = stemDown ? (lowestY * scaleY) + 28 * scaleY : (highestY * scaleY) - 28 * scaleY;
                                                    const numFlags = ev.beatValue <= 0.25 ? 2 : ev.beatValue <= 0.75 ? 1 : 0;

                                                    return (
                                                        <g>
                                                            <line
                                                                x1={xPos}
                                                                y1={highestY * scaleY}
                                                                x2={xPos}
                                                                y2={extY}
                                                                stroke={activeStrokeColor}
                                                                strokeWidth={1.6 * scaleY}
                                                            />
                                                            {numFlags >
                                                                0 && (
                                                                    <path
                                                                        d={getFlagPath(xPos, extY, stemDown, numFlags)}
                                                                        fill={activeStrokeColor} />
                                                                )}
                                                        </g>
                                                    );
                                                })()}

                                            {[6.0, 3.0, 1.5, 0.75].includes(
                                                ev.beatValue) && (
                                                    <circle
                                                        cx={ev.cx + 12}
                                                        cy={((ev.trebleStem?.highestY || ev.bassStem?.highestY || trebleTopY) - 3) * scaleY}
                                                        r={3 * scaleY}
                                                        fill={currentNoteFill} />
                                                )}
                                        </>}
                                    </g>
                                )}

                                {!ev.isMetronomeTick && showTab && (
                                    <g>
                                        <rect
                                            x={ev.cx - SLOT_WIDTH / 2 + 4}
                                            y={yLane - 18 * scaleY}
                                            width={SLOT_WIDTH - 8}
                                            height={24 * scaleY}
                                            fill={ev.voice === 2 ? DARK_THEME.voice2RhythmBg : DARK_THEME.voice1RhytmBg}
                                            rx="2" />
                                        {ev.isTiedToNext &&
                                            (() => {
                                                const nextEv = rowEvents
                                                    .slice(idx + 1)
                                                    .find(e => e.voice === ev.voice);
                                                if (nextEv)
                                                    return (
                                                        <line
                                                            x1={ev.cx + 20}
                                                            y1={yLane - 4 * scaleY}
                                                            x2={nextEv.cx - 20}
                                                            y2={yLane - 4 * scaleY}
                                                            stroke={DARK_THEME.lineStaff}
                                                            strokeWidth="2"
                                                            strokeLinecap="round" />
                                                    );
                                                return null;
                                            })()}
                                        <text
                                            x={ev.cx}
                                            y={yLane}
                                            textAnchor="middle"
                                            className="font-mono font-black text-sm"
                                            fill={isMuted ? DARK_THEME.inactiveVoiceColor :
                                                (ev.isRest ? DARK_THEME.fillRest : (ev.voice === 2 ? DARK_THEME.voice2Rhythm : DARK_THEME.voice1Rhythm))}
                                        >
                                            {ev.rhythm}
                                        </text>
                                    </g>
                                )}
                                <rect
                                    x={ev.cx - SLOT_WIDTH / 2}
                                    y={hitTestY}
                                    width={SLOT_WIDTH}
                                    height={hitTestH}
                                    fill="transparent"
                                    pointerEvents="all"
                                    onPointerEnter={() => {
                                        if (!isPlaying || isPaused)
                                            setHoveredNoteIndex(ev.globalIndex);
                                    }}
                                    onPointerLeave={() => {
                                        if (!isPlaying || isPaused)
                                            setHoveredNoteIndex(null);
                                    }}
                                    onPointerDown={() => {
                                        if (!isPlaying || isPaused)
                                            setHoveredNoteIndex(ev.globalIndex);
                                    }}
                                    onPointerUp={() => {
                                        if (!isPlaying || isPaused)
                                            setHoveredNoteIndex(null);
                                    }}
                                    onClick={() => {
                                        if (!isPlaying || isPaused)
                                            handleNoteClick(ev.globalIndex);
                                    }} />
                            </g>
                        );
                    })}
                </svg>
            </div>
        );
    };
}
