import { DARK_THEME, getFlagPath } from "./guitaleleViewerUtils";

export function buildSvg(svgHeight, paddingX, trebleTopY, bassTopY, lineSpacing, timeSigTop, timeSigBottom, tabTopY, measureValidityMap, rhythmTopY, beatsPerMeasure, activeIndices, rhythm2TopY, rhythm1TopY, SLOT_WIDTH, isPlaying, setHoveredNoteIndex) {
    return (
        {
            rowEvents, totalWidth, barlineXPositions, measureGroups, rowEndX
        },
        rowIdx
    ) => {
        // 1. Dynamically compute precise vertical bounds based on drawn elements
        // Top-most element is the highlight glow / invalid measure box (trebleTopY - 50)
        const minY = trebleTopY - 20;

        // Bottom-most elements are either the rhythm lane 2 background or the measure validity descriptions
        const maxRhythmY = rhythmTopY + 80; // Covers rhythm text + background rect boundaries
        const maxValidityTextY = tabTopY + (5 * lineSpacing) + 65; // Covers measure debug details
        const maxY = Math.max(maxRhythmY, maxValidityTextY);

        // Calculate the exact height needed to fit everything snugly
        const calculatedHeight = maxY - minY;

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
                        d={`M ${paddingX - 115} ${trebleTopY} L ${paddingX - 122} ${trebleTopY} L ${paddingX - 122} ${bassTopY + 4 * lineSpacing} L ${paddingX - 115} ${bassTopY + 4 * lineSpacing}`}
                        fill="none"
                        stroke={DARK_THEME.lineStaff}
                        strokeWidth="2.5" />

                    {[0, 1, 2, 3, 4].map(i => (
                        <line
                            key={`treble-${i}`}
                            x1={paddingX}
                            y1={trebleTopY + i * lineSpacing}
                            x2={rowEndX}
                            y2={trebleTopY + i * lineSpacing}
                            stroke={DARK_THEME.lineStaff}
                            strokeWidth="1" />
                    ))}
                    <text
                        x={paddingX - 105}
                        y={trebleTopY + 3.5 * lineSpacing}
                        className="text-4xl font-serif"
                        fill={DARK_THEME.textClef}
                    >
                        𝄞
                    </text>

                    {[0, 1, 2, 3, 4].map(i => (
                        <line
                            key={`bass-${i}`}
                            x1={paddingX}
                            y1={bassTopY + i * lineSpacing}
                            x2={rowEndX}
                            y2={bassTopY + i * lineSpacing}
                            stroke={DARK_THEME.lineStaff}
                            strokeWidth="1" />
                    ))}
                    <text
                        x={paddingX - 105}
                        y={bassTopY + 3.2 * lineSpacing}
                        className="text-4xl font-serif"
                        fill={DARK_THEME.textClef}
                    >
                        𝄢
                    </text>

                    <g
                        className="font-serif font-black text-2xl text-center"
                        fill={DARK_THEME.textTimeSig}
                        transform={`translate(${paddingX - 55}, 0)`}
                    >
                        <text
                            x="0"
                            y={trebleTopY + 16}
                            textAnchor="middle"
                        >
                            {timeSigTop}
                        </text>
                        <text
                            x="0"
                            y={trebleTopY + 42}
                            textAnchor="middle"
                        >
                            {timeSigBottom}
                        </text>
                        <text
                            x="0"
                            y={bassTopY + 16}
                            textAnchor="middle"
                        >
                            {timeSigTop}
                        </text>
                        <text
                            x="0"
                            y={bassTopY + 42}
                            textAnchor="middle"
                        >
                            {timeSigBottom}
                        </text>
                        <text
                            x="0"
                            y={tabTopY + 24}
                            textAnchor="middle"
                            className="text-xl font-sans font-bold"
                            fill={DARK_THEME.textTabLabel}
                        >
                            {timeSigTop}
                        </text>
                        <text
                            x="0"
                            y={tabTopY + 54}
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
                            x1={paddingX}
                            y1={tabTopY + i * lineSpacing}
                            x2={rowEndX}
                            y2={tabTopY + i * lineSpacing}
                            stroke={DARK_THEME.lineTab}
                            strokeWidth="1.2" />
                    ))}
                    <g
                        transform={`translate(${paddingX - 105}, ${tabTopY + 12})`}
                        fill={DARK_THEME.textTabLabel}
                        className="font-black tracking-tighter text-xs"
                    >
                        <text x="0" y="0">
                            T
                        </text>
                        <text x="0" y="14">
                            A
                        </text>
                        <text x="0" y="28">
                            B
                        </text>
                    </g>
                    {[0, 1, 2, 3, 4, 5].map(i => (
                        <text
                            key={`string-${i}`}
                            x={paddingX - 15}
                            y={tabTopY + i * lineSpacing + 4}
                            textAnchor="end"
                            className="text-[9px] font-bold"
                            fill={DARK_THEME.textTabString}
                        >
                            {i + 1}
                        </text>
                    ))}

                    <line
                        x1={paddingX}
                        y1={trebleTopY}
                        x2={paddingX}
                        y2={bassTopY + 4 * lineSpacing}
                        stroke={DARK_THEME.lineBar}
                        strokeWidth="2" />
                    <line
                        x1={paddingX}
                        y1={tabTopY}
                        x2={paddingX}
                        y2={tabTopY + 5 * lineSpacing}
                        stroke={DARK_THEME.lineTab}
                        strokeWidth="2" />

                    {barlineXPositions.map((barX, i) => (
                        <g key={`barline-${i}`}>
                            <line
                                x1={barX}
                                y1={trebleTopY}
                                x2={barX}
                                y2={bassTopY + 4 * lineSpacing}
                                stroke={DARK_THEME.lineBar}
                                strokeWidth={i ===
                                    barlineXPositions.length - 1
                                    ? "2"
                                    : "1.6"} />
                            <line
                                x1={barX}
                                y1={tabTopY}
                                x2={barX}
                                y2={tabTopY + 5 * lineSpacing}
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
                                        y={trebleTopY - 40}
                                        width={measure.endX -
                                            measure.startX}
                                        height={rhythmTopY -
                                            trebleTopY +
                                            85}
                                        fill={DARK_THEME.bgInvalidMeasure}
                                        stroke="rgba(239, 68, 68, 0.4)"
                                        strokeWidth="1.5"
                                        rx={6} />
                                )}

                                <text
                                    x={measureCenterX}
                                    y={tabTopY +
                                        5 * lineSpacing +
                                        32}
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
                                                y={tabTopY +
                                                    5 *
                                                    lineSpacing +
                                                    48}
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

                        const yLane = ev.voice === 2
                            ? rhythm2TopY
                            : rhythm1TopY;
                        const restTabOffset = ev.voice === 2 ? 16 : -16;

                        return (
                            <g key={`node-${idx}`}>
                                {isPrimaryHighlightNode && (
                                    <rect
                                        data-active-indicator="true"
                                        x={ev.cx - SLOT_WIDTH / 2 + 2}
                                        y={trebleTopY - 50}
                                        width={SLOT_WIDTH - 4}
                                        height={rhythmTopY - trebleTopY + 95}
                                        fill={DARK_THEME.fillHoverHighlight}
                                        rx={4} />
                                )}

                                <rect
                                    x={ev.cx - SLOT_WIDTH / 2}
                                    y={trebleTopY - 15}
                                    width={SLOT_WIDTH}
                                    height={rhythmTopY -
                                        trebleTopY +
                                        65}
                                    fill="transparent"
                                    pointerEvents="all"
                                    onMouseEnter={() => {
                                        if (!isPlaying)
                                            setHoveredNoteIndex(
                                                ev.globalIndex
                                            );
                                    }}
                                    onMouseLeave={() => {
                                        if (!isPlaying)
                                            setHoveredNoteIndex(
                                                null
                                            );
                                    }} />

                                {ev.isRest ? (
                                    <g>
                                        {ev.rhythm === "r" && (
                                            <path
                                                d={`M ${ev.cx - 4} ${trebleTopY + 28} L ${ev.cx + 4} ${trebleTopY + 34} L ${ev.cx - 4} ${trebleTopY + 40} Q ${ev.cx + 6} ${trebleTopY + 44} ${ev.cx} ${trebleTopY + 50}`}
                                                fill="none"
                                                stroke={DARK_THEME.fillRest}
                                                strokeWidth="2"
                                                strokeLinecap="round" />
                                        )}
                                        {ev.rhythm === "r+" && (
                                            <path
                                                d={`M ${ev.cx - 3} ${trebleTopY + 32} A 3.5 3.5 0 1 1 ${ev.cx + 2} ${trebleTopY + 34} Q ${ev.cx - 2} ${trebleTopY + 38} ${ev.cx + 4} ${trebleTopY + 30} L ${ev.cx - 3} ${trebleTopY + 50}`}
                                                fill="none"
                                                stroke={DARK_THEME.fillRest}
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round" />
                                        )}
                                        {ev.rhythm === "r=" && (
                                            <g>
                                                <path
                                                    d={`M ${ev.cx - 2} ${trebleTopY + 27} A 3 3 0 1 1 ${ev.cx + 3} ${trebleTopY + 29} Q ${ev.cx - 1} ${trebleTopY + 33} ${ev.cx + 5} ${trebleTopY + 25}`}
                                                    fill="none"
                                                    stroke={DARK_THEME.fillRest}
                                                    strokeWidth="2" />
                                                <path
                                                    d={`M ${ev.cx - 4} ${trebleTopY + 36} A 3 3 0 1 1 ${ev.cx + 1} ${trebleTopY + 38} Q ${ev.cx - 3} ${trebleTopY + 42} ${ev.cx + 3} ${trebleTopY + 34} L ${ev.cx - 4} ${trebleTopY + 52}`}
                                                    fill="none"
                                                    stroke={DARK_THEME.fillRest}
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round" />
                                            </g>
                                        )}

                                        <rect
                                            x={ev.cx - 8}
                                            y={tabTopY +
                                                2 *
                                                lineSpacing -
                                                4 +
                                                restTabOffset}
                                            width={19}
                                            height={20}
                                            fill={DARK_THEME.bgTabRect} />
                                        <text
                                            x={ev.cx}
                                            y={tabTopY +
                                                3 *
                                                lineSpacing -
                                                6 +
                                                restTabOffset}
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
                                                const clefTopY = pitch.clef ===
                                                    "treble"
                                                    ? trebleTopY
                                                    : bassTopY;
                                                const bottomStaffEdge = clefTopY +
                                                    4 *
                                                    lineSpacing;
                                                const lowerLedgers = pitch.staffY >
                                                    bottomStaffEdge
                                                    ? Math.floor(
                                                        (pitch.staffY -
                                                            bottomStaffEdge) /
                                                        lineSpacing
                                                    )
                                                    : 0;
                                                const upperLedgers = pitch.staffY <
                                                    clefTopY
                                                    ? Math.floor(
                                                        (clefTopY -
                                                            pitch.staffY) /
                                                        lineSpacing
                                                    )
                                                    : 0;

                                                const voiceColor = ev.voice ===
                                                    2
                                                    ? DARK_THEME.voice2Color
                                                    : DARK_THEME.voice1Color;
                                                const activeNoteColor = isActive
                                                    ? voiceColor
                                                    : DARK_THEME.fillNote;
                                                const activeStrokeColor = isActive
                                                    ? voiceColor
                                                    : DARK_THEME.fillNote;
                                                const glowFilter = isActive
                                                    ? "url(#note-glow)"
                                                    : "none";

                                                return (
                                                    <g
                                                        key={`p-${pIdx}`}
                                                    >
                                                        {pitch.isSharp && (
                                                            <text
                                                                x={ev.cx +
                                                                    10}
                                                                y={pitch.staffY +
                                                                    5}
                                                                className="text-base font-normal font-serif"
                                                                fill={activeStrokeColor}
                                                                filter={glowFilter}
                                                            >
                                                                ♯
                                                            </text>
                                                        )}

                                                        {Array.from(
                                                            {
                                                                length: Math.max(
                                                                    0,
                                                                    upperLedgers
                                                                )
                                                            }
                                                        ).map(
                                                            (
                                                                _,
                                                                lIdx
                                                            ) => (
                                                                <line
                                                                    key={`up-ledg-${lIdx}`}
                                                                    x1={ev.cx -
                                                                        10}
                                                                    y1={clefTopY -
                                                                        (lIdx +
                                                                            1) *
                                                                        lineSpacing}
                                                                    x2={ev.cx +
                                                                        10}
                                                                    y2={clefTopY -
                                                                        (lIdx +
                                                                            1) *
                                                                        lineSpacing}
                                                                    stroke={DARK_THEME.lineStaff}
                                                                    strokeWidth="1.2" />
                                                            )
                                                        )}
                                                        {Array.from(
                                                            {
                                                                length: Math.max(
                                                                    0,
                                                                    lowerLedgers
                                                                )
                                                            }
                                                        ).map(
                                                            (
                                                                _,
                                                                lIdx
                                                            ) => (
                                                                <line
                                                                    key={`low-ledg-${lIdx}`}
                                                                    x1={ev.cx -
                                                                        10}
                                                                    y1={bottomStaffEdge +
                                                                        (lIdx +
                                                                            1) *
                                                                        lineSpacing}
                                                                    x2={ev.cx +
                                                                        10}
                                                                    y2={bottomStaffEdge +
                                                                        (lIdx +
                                                                            1) *
                                                                        lineSpacing}
                                                                    stroke={DARK_THEME.lineStaff}
                                                                    strokeWidth="1.2" />
                                                            )
                                                        )}

                                                        {pitch.fret ===
                                                            null ? (
                                                            <g>
                                                                <line
                                                                    x1={ev.cx -
                                                                        6}
                                                                    y1={pitch.staffY -
                                                                        6}
                                                                    x2={ev.cx +
                                                                        6}
                                                                    y2={pitch.staffY +
                                                                        6}
                                                                    stroke={activeStrokeColor}
                                                                    strokeWidth="1.8"
                                                                    strokeLinecap="round" />
                                                                <line
                                                                    x1={ev.cx -
                                                                        6}
                                                                    y1={pitch.staffY +
                                                                        6}
                                                                    x2={ev.cx +
                                                                        6}
                                                                    y2={pitch.staffY -
                                                                        6}
                                                                    stroke={activeStrokeColor}
                                                                    strokeWidth="1.8"
                                                                    strokeLinecap="round" />
                                                            </g>
                                                        ) : ev.beatValue >=
                                                            2.0 ? (
                                                            <ellipse
                                                                cx={ev.cx}
                                                                cy={pitch.staffY}
                                                                rx={5.5}
                                                                ry={4}
                                                                transform={`rotate(-22 ${ev.cx} ${pitch.staffY})`}
                                                                fill="none"
                                                                stroke={activeStrokeColor}
                                                                strokeWidth="1.8"
                                                                filter={glowFilter} />
                                                        ) : (
                                                            <ellipse
                                                                cx={ev.cx}
                                                                cy={pitch.staffY}
                                                                rx={5.5}
                                                                ry={4}
                                                                transform={`rotate(-22 ${ev.cx} ${pitch.staffY})`}
                                                                fill={activeNoteColor}
                                                                filter={glowFilter} />
                                                        )}

                                                        {ev.isTiedToNext &&
                                                            pitch.fret !==
                                                            null &&
                                                            (() => {
                                                                const nextEv = rowEvents
                                                                    .slice(
                                                                        idx +
                                                                        1
                                                                    )
                                                                    .find(
                                                                        e => e.voice ===
                                                                            ev.voice &&
                                                                            !e.isRest
                                                                    );
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
                                                                            d={`M ${ev.cx + 4} ${pitch.staffY + 5} Q ${(ev.cx + nextEv.cx) / 2} ${Math.max(pitch.staffY, targetPitch.staffY) + 16} ${nextEv.cx - 4} ${targetPitch.staffY + 5}`}
                                                                            fill="none"
                                                                            stroke={DARK_THEME.lineTie}
                                                                            strokeWidth="1.8"
                                                                            strokeLinecap="round" />
                                                                    );
                                                                }
                                                                return null;
                                                            })()}

                                                        {ev.isTiedToNext &&
                                                            pitch.fret !==
                                                            null &&
                                                            (() => {
                                                                const nextEv = rowEvents
                                                                    .slice(
                                                                        idx +
                                                                        1
                                                                    )
                                                                    .find(
                                                                        e => e.voice ===
                                                                            ev.voice &&
                                                                            !e.isRest
                                                                    );
                                                                if (!nextEv)
                                                                    return null;

                                                                const targetPitch = nextEv.processedPitches.find(
                                                                    np => np.string ===
                                                                        pitch.string
                                                                );
                                                                if (!targetPitch ||
                                                                    targetPitch.fret ===
                                                                    null)
                                                                    return null;

                                                                const isTieActive = activeIndices.includes(
                                                                    ev.globalIndex
                                                                ) ||
                                                                    activeIndices.includes(
                                                                        nextEv.globalIndex
                                                                    );
                                                                const tieStrokeColor = isTieActive
                                                                    ? ev.voice ===
                                                                        2
                                                                        ? DARK_THEME.voice2Color
                                                                        : DARK_THEME.voice1Color
                                                                    : DARK_THEME.lineTie;
                                                                const tieGlow = isTieActive
                                                                    ? "url(#note-glow)"
                                                                    : "none";

                                                                if (targetPitch.midi ===
                                                                    pitch.midi) {
                                                                    return (
                                                                        <path
                                                                            d={`M ${ev.cx + 4} ${pitch.tabY} Q ${(ev.cx + nextEv.cx) / 2} ${pitch.tabY + 12} ${nextEv.cx - 4} ${targetPitch.tabY}`}
                                                                            fill="none"
                                                                            stroke={tieStrokeColor}
                                                                            strokeWidth={isTieActive
                                                                                ? "2.5"
                                                                                : "1.8"}
                                                                            strokeLinecap="round"
                                                                            filter={tieGlow} />
                                                                    );
                                                                } else {
                                                                    return (
                                                                        <line
                                                                            x1={ev.cx +
                                                                                12}
                                                                            y1={pitch.tabY}
                                                                            x2={nextEv.cx -
                                                                                12}
                                                                            y2={targetPitch.tabY}
                                                                            stroke={tieStrokeColor}
                                                                            strokeWidth={isTieActive
                                                                                ? "3"
                                                                                : "2"}
                                                                            strokeLinecap="round"
                                                                            filter={tieGlow} />
                                                                    );
                                                                }
                                                            })()}

                                                        <rect
                                                            x={ev.cx -
                                                                13}
                                                            y={pitch.tabY -
                                                                11}
                                                            width={20}
                                                            height={18}
                                                            fill="#0f172a"
                                                            stroke={activeStrokeColor}
                                                            strokeWidth={isActive
                                                                ? "2"
                                                                : "1.5"}
                                                            filter={glowFilter}
                                                            rx={3} />

                                                        <text
                                                            x={ev.cx -
                                                                3}
                                                            y={pitch.tabY +
                                                                3.2}
                                                            textAnchor="middle"
                                                            className="text-xs font-sans font-black tracking-wide"
                                                            fill={isActive
                                                                ? DARK_THEME.textTabNumberHover
                                                                : DARK_THEME.textTabNumber}
                                                        >
                                                            {pitch.fret ===
                                                                null
                                                                ? "X"
                                                                : pitch.fret}
                                                        </text>
                                                    </g>
                                                );
                                            }
                                        )}

                                        {ev.trebleStem &&
                                            ev.beatValue <
                                            4.0 &&
                                            (() => {
                                                const voiceColor = ev.voice ===
                                                    2
                                                    ? DARK_THEME.voice2Color
                                                    : DARK_THEME.voice1Color;
                                                const activeStrokeColor = isActive
                                                    ? voiceColor
                                                    : DARK_THEME.fillNote;
                                                const glowFilter = isActive
                                                    ? "url(#note-glow)"
                                                    : "none";

                                                const {
                                                    lowestY, highestY, stemDown
                                                } = ev.trebleStem;
                                                const xPos = stemDown
                                                    ? ev.cx -
                                                    5.5
                                                    : ev.cx +
                                                    5.5;
                                                const extY = stemDown
                                                    ? lowestY +
                                                    28
                                                    : highestY -
                                                    28;
                                                const numFlags = ev.beatValue <=
                                                    0.25
                                                    ? 2
                                                    : ev.beatValue <=
                                                        0.75
                                                        ? 1
                                                        : 0;

                                                return (
                                                    <g
                                                        filter={glowFilter}
                                                    >
                                                        <line
                                                            x1={xPos}
                                                            y1={highestY}
                                                            x2={xPos}
                                                            y2={extY}
                                                            stroke={activeStrokeColor}
                                                            strokeWidth="1.6" />
                                                        {numFlags >
                                                            0 && (
                                                                <path
                                                                    d={getFlagPath(
                                                                        xPos,
                                                                        extY,
                                                                        stemDown,
                                                                        numFlags
                                                                    )}
                                                                    fill={activeStrokeColor} />
                                                            )}
                                                    </g>
                                                );
                                            })()}

                                        {ev.bassStem &&
                                            ev.beatValue <
                                            4.0 &&
                                            (() => {
                                                const voiceColor = ev.voice ===
                                                    2
                                                    ? DARK_THEME.voice2Color
                                                    : DARK_THEME.voice1Color;
                                                const activeStrokeColor = isActive
                                                    ? voiceColor
                                                    : DARK_THEME.fillNote;
                                                const glowFilter = isActive
                                                    ? "url(#note-glow)"
                                                    : "none";

                                                const {
                                                    lowestY, highestY, stemDown
                                                } = ev.bassStem;
                                                const xPos = stemDown
                                                    ? ev.cx -
                                                    5.5
                                                    : ev.cx +
                                                    5.5;
                                                const extY = stemDown
                                                    ? lowestY +
                                                    28
                                                    : highestY -
                                                    28;
                                                const numFlags = ev.beatValue <=
                                                    0.25
                                                    ? 2
                                                    : ev.beatValue <=
                                                        0.75
                                                        ? 1
                                                        : 0;

                                                return (
                                                    <g
                                                        filter={glowFilter}
                                                    >
                                                        <line
                                                            x1={xPos}
                                                            y1={highestY}
                                                            x2={xPos}
                                                            y2={extY}
                                                            stroke={activeStrokeColor}
                                                            strokeWidth="1.6" />
                                                        {numFlags >
                                                            0 && (
                                                                <path
                                                                    d={getFlagPath(
                                                                        xPos,
                                                                        extY,
                                                                        stemDown,
                                                                        numFlags
                                                                    )}
                                                                    fill={activeStrokeColor} />
                                                            )}
                                                    </g>
                                                );
                                            })()}

                                        {[
                                            6.0, 3.0, 1.5, 0.75
                                        ].includes(
                                            ev.beatValue
                                        ) && (
                                                <circle
                                                    cx={ev.cx + 12}
                                                    cy={(ev
                                                        .trebleStem
                                                        ?.highestY ||
                                                        ev
                                                            .bassStem
                                                            ?.highestY ||
                                                        trebleTopY) -
                                                        3}
                                                    r={2}
                                                    fill={currentNoteFill} />
                                            )}
                                    </g>
                                )}

                                <g>
                                    <rect
                                        x={ev.cx -
                                            SLOT_WIDTH / 2 +
                                            4}
                                        y={yLane - 18}
                                        width={SLOT_WIDTH - 8}
                                        height={24}
                                        fill={ev.voice === 2
                                            ? "rgba(236, 72, 153, 0.08)"
                                            : "rgba(96, 165, 250, 0.08)"}
                                        rx="2" />
                                    {ev.isTiedToNext &&
                                        (() => {
                                            const nextEv = rowEvents
                                                .slice(
                                                    idx + 1
                                                )
                                                .find(
                                                    e => e.voice ===
                                                        ev.voice
                                                );
                                            if (nextEv)
                                                return (
                                                    <line
                                                        x1={ev.cx +
                                                            20}
                                                        y1={yLane -
                                                            4}
                                                        x2={nextEv.cx -
                                                            20}
                                                        y2={yLane -
                                                            4}
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
                                        fill={ev.isRest
                                            ? DARK_THEME.fillRest
                                            : ev.voice === 2
                                                ? DARK_THEME.voice2Rhythm
                                                : DARK_THEME.voice1Rhythm}
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