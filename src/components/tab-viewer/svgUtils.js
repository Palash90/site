import { DARK_THEME, getFlagPath } from "./guitaleleViewerUtils";

export function buildSvg(paddingX, trebleTopY, bassTopY, lineSpacing, timeSigTop, timeSigBottom, tabTopY, measureValidityMap, rhythmTopY, beatsPerMeasure, activeIndices, rhythm2TopY, rhythm1TopY, SLOT_WIDTH, isPlaying, isPaused, playbackIndex, setHoveredNoteIndex, measuresPerRow, voice1Enabled, voice2Enabled) {
    return (
        {
            rowEvents, totalWidth, barlineXPositions, measureGroups, rowEndX
        },
        rowIdx
    ) => {
        // Determine the vertical scaling factor based on the responsive measures layout profile
        const scaleY = measuresPerRow === 1 ? 0.62 : measuresPerRow === 2 ? 0.78 : 1.0;
        const sLineSpacing = lineSpacing * scaleY;

        const leftMargin = (paddingX - 105) * (measuresPerRow === 4 ? 1 : 0.85);

        // 1. Dynamically compute precise vertical bounds based on drawn elements
        const minY = (trebleTopY - 55) * scaleY;

        // Bottom-most elements are either the rhythm lane 2 background or the measure validity descriptions
        const maxRhythmY = (rhythmTopY + 80) * scaleY; // Covers rhythm text + background rect boundaries
        const maxValidityTextY = (tabTopY + (5 * lineSpacing) + 65) * scaleY; // Covers measure debug details
        const maxY = Math.max(maxRhythmY, maxValidityTextY);

        // Calculate the exact height needed to fit everything snugly
        const calculatedHeight = maxY - minY;

        const fretFontSize = 16 * scaleY + 'px';
        return (
            <div
                key={`row-${rowIdx}`}
                className={`${DARK_THEME.bgScore} ${DARK_THEME.borderScore} border rounded-lg shadow-xl p-4 w-full overflow-x-auto flex justify-start md:justify-center`}
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
                        <filter
                            id="note-glow"
                            x="-50%"
                            y="-50%"
                            width="200%"
                            height="200%"
                        >
                            <feGaussianBlur
                                stdDeviation="3"
                                result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    <path
                        d={`M ${paddingX - 115} ${trebleTopY * scaleY} L ${paddingX - 122} ${trebleTopY * scaleY} L ${paddingX - 122} ${(bassTopY + 4 * lineSpacing) * scaleY} L ${paddingX - 115} ${(bassTopY + 4 * lineSpacing) * scaleY}`}
                        fill="none"
                        stroke={DARK_THEME.lineStaff}
                        strokeWidth="2.5" />

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

                    <g
                        className="font-serif font-black text-2xl text-center"
                        fill={DARK_THEME.textTimeSig}
                        transform={`translate(${paddingX - (90 * (measuresPerRow === 4 ? 0.7 : measuresPerRow === 2 ? 0.8 : 0.9))}, 0)`}
                    >
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
                    </g>

                    {[0, 1, 2, 3, 4, 5].map(i => (
                        <line
                            key={`t-l-${i}`}
                            x1={paddingX - 40 * (measuresPerRow === 4 ? 0.7 : measuresPerRow === 2 ? 0.8 : 0.9)}
                            y1={(tabTopY * scaleY) + i * sLineSpacing}
                            x2={rowEndX}
                            y2={(tabTopY * scaleY) + i * sLineSpacing}
                            stroke={DARK_THEME.lineTab}
                            strokeWidth="2" />
                    ))}
                    <g
                        transform={`translate(${leftMargin}, ${(tabTopY * scaleY) + 36 * scaleY})`}
                        fill={DARK_THEME.textTabLabel}
                        style={{ fontSize: `${36 * scaleY}px`, fontWeight: "900", letterSpacing: "-0.1em" }}
                    >
                        <text x="0" y="0">
                            T
                        </text>
                        <text x="0" y={36 * scaleY}>
                            A
                        </text>
                        <text x="0" y={72 * scaleY}>
                            B
                        </text>
                    </g>
                    {[0, 1, 2, 3, 4, 5].map(i => (
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
                    <line
                        x1={paddingX - 40 * (measuresPerRow === 4 ? 0.7 : measuresPerRow === 2 ? 0.8 : 0.9)}
                        y1={tabTopY * scaleY}
                        x2={paddingX - 40 * (measuresPerRow === 4 ? 0.7 : measuresPerRow === 2 ? 0.8 : 0.9)}
                        y2={(tabTopY + 5 * lineSpacing) * scaleY}
                        stroke={DARK_THEME.lineTab}
                        strokeWidth="2" />

                    {barlineXPositions.map((barX, i) => (
                        <g key={`barline-${i}`}>
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
                                {isMeasureInvalid && (
                                    <rect
                                        x={measure.startX}
                                        y={(trebleTopY - 40) * scaleY}
                                        width={measure.endX -
                                            measure.startX}
                                        height={(rhythmTopY -
                                            trebleTopY +
                                            85) * scaleY}
                                        fill={DARK_THEME.bgInvalidMeasure}
                                        stroke="rgba(239, 68, 68, 0.4)"
                                        strokeWidth="1.5"
                                        rx={6} />
                                )}

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

                                {isMeasureInvalid &&
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
                        const isActive = activeIndices.includes(
                            ev.globalIndex
                        );
                        const isPrimaryHighlightNode = isActive &&
                            activeIndices[0] === ev.globalIndex;
                        const currentNoteFill = isActive
                            ? DARK_THEME.fillNoteHover
                            : DARK_THEME.fillNote;

                        const yLane = (ev.voice === 2
                            ? rhythm2TopY
                            : rhythm1TopY) * scaleY;
                        const restTabOffset = (ev.voice === 2 ? 16 : -16) * scaleY;
                        const isMuted = (ev.voice === 1 && !voice1Enabled) || (ev.voice === 2 && !voice2Enabled);

                        return (
                            <g key={`node-${idx}`}>
                                {isPrimaryHighlightNode && (
                                    <rect
                                        data-active-indicator="true"
                                        x={ev.cx - SLOT_WIDTH / 2 + 2}
                                        y={(trebleTopY - 50) * scaleY}
                                        width={SLOT_WIDTH - 4}
                                        height={(rhythmTopY - trebleTopY + 95) * scaleY}
                                        fill={DARK_THEME.fillHoverHighlight}
                                        rx={4} />
                                )}

                                {isPaused && playbackIndex === ev.globalIndex && (
                                    <rect
                                        data-paused-indicator="true"
                                        x={ev.cx - SLOT_WIDTH / 2 + 2}
                                        y={(trebleTopY - 50) * scaleY}
                                        width={SLOT_WIDTH - 4}
                                        height={(rhythmTopY - trebleTopY + 95) * scaleY}
                                        fill="none"
                                        stroke={DARK_THEME.textTabNumberHover}
                                        strokeDasharray="5 4"
                                        strokeWidth={1.6}
                                        rx={4}
                                        pointerEvents="none" />
                                )}

                                <rect
                                    x={ev.cx - SLOT_WIDTH / 2}
                                    y={(trebleTopY - 15) * scaleY}
                                    width={SLOT_WIDTH}
                                    height={(rhythmTopY -
                                        trebleTopY +
                                        65) * scaleY}
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
                                            setHoveredNoteIndex(ev.globalIndex);
                                    }} />

                                {ev.isRest ? (
                                    <g style={{ opacity: isMuted ? 0.4 : 1 }}>
                                        {/* Whole and Half rest rendering based on beatValue */}
                                        {ev.beatValue === 4.0 ? (
                                            // Whole rest (small rectangle hanging from the staff)
                                            <rect
                                                x={ev.cx - 7}
                                                y={(trebleTopY * scaleY) + 1 * sLineSpacing - (sLineSpacing * 0.05)}
                                                width={14}
                                                height={sLineSpacing * 0.6}
                                                fill={DARK_THEME.fillRest}
                                                rx={1} />
                                        ) : ev.beatValue === 2.0 ? (
                                            // Half rest (small rectangle sitting on the staff)
                                            <rect
                                                x={ev.cx - 7}
                                                y={(trebleTopY * scaleY) + 2 * sLineSpacing + (sLineSpacing * 0.4)}
                                                width={14}
                                                height={sLineSpacing * 0.6}
                                                fill={DARK_THEME.fillRest}
                                                rx={1} />
                                        ) : (
                                            // Quarter / Eighth / Sixteenth rests (existing shapes)
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

                                        <rect
                                            x={ev.cx - 8}
                                            y={(tabTopY + 2 * lineSpacing - 4) * scaleY + restTabOffset}
                                            width={19}
                                            height={20 * scaleY}
                                            fill={DARK_THEME.bgTabRect} />
                                        <text
                                            x={ev.cx}
                                            y={(tabTopY + 3 * lineSpacing - 6) * scaleY + restTabOffset}
                                            textAnchor="middle"
                                            className="text-lg font-mono font-bold"
                                            fill={DARK_THEME.fillRest}
                                        >
                                            𝄾
                                        </text>
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

                                                        {ev.isTiedToNext &&
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

                                                                const isTieActive = activeIndices.includes(ev.globalIndex) || activeIndices.includes(nextEv.globalIndex);
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
                                                    </g>
                                                );
                                            }
                                        )}

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
                                                    <g
                                                        filter={glowFilter}
                                                    >
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
                                                    <g filter={glowFilter}                                                    >
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
                                    </g>
                                )}

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
                            </g>
                        );
                    })}
                </svg>
            </div>
        );
    };
}