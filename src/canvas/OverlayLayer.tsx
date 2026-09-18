import type { Point } from '../types';
import { FAULT_COLOR, UI_GRAPHITE, UI_TEAL } from '../constants';
import { useToolStore } from '../store/useToolStore';
import { useViewStore } from '../store/useViewStore';

const ptsAttr = (pts: Point[]) => pts.map((p) => `${p.x},${p.y}`).join(' ');

/** Feedback en vivo: polilínea en curso, snap, regla y bisectriz. */
export function OverlayLayer() {
  const tool = useToolStore((s) => s.tool);
  const drawing = useToolStore((s) => s.drawing);
  const cursor = useToolStore((s) => s.cursorWorld);
  const snapHit = useToolStore((s) => s.snapHit);
  const currentColor = useToolStore((s) => s.currentColor);
  const pendingBisector = useToolStore((s) => s.pendingBisector);
  const splitMode = useToolStore((s) => s.splitMode);
  const zoom = useViewStore((s) => s.view.zoom);

  const px = (n: number) => n / zoom;

  const drawingColor =
    tool === 'horizon'
      ? currentColor
      : tool === 'faultReverse' || tool === 'faultNormal'
        ? FAULT_COLOR
        : tool === 'split'
          ? '#E08A00'
          : UI_GRAPHITE;

  const isDrawingTool =
    tool === 'horizon' ||
    tool === 'faultReverse' ||
    tool === 'faultNormal' ||
    tool === 'ruler' ||
    (tool === 'split' && splitMode === 'trace');

  const dashed = tool === 'ruler' || tool === 'split';
  const livePoint = snapHit?.point ?? cursor;

  return (
    <g id="overlay-layer" pointerEvents="none">
      {isDrawingTool && drawing.length > 0 && (
        <>
          <polyline
            points={ptsAttr(drawing)}
            fill="none"
            stroke={drawingColor}
            strokeWidth={2.4}
            strokeDasharray={dashed ? '6 5' : undefined}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          {livePoint && (
            <line
              x1={drawing[drawing.length - 1].x}
              y1={drawing[drawing.length - 1].y}
              x2={livePoint.x}
              y2={livePoint.y}
              stroke={drawingColor}
              strokeWidth={1.6}
              strokeDasharray="4 4"
              strokeOpacity={0.8}
              vectorEffect="non-scaling-stroke"
            />
          )}
          {drawing.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={px(3.4)}
              fill="#fff"
              stroke={drawingColor}
              strokeWidth={1.6}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </>
      )}

      {pendingBisector && (
        <line
          x1={pendingBisector.origin.x - pendingBisector.dir.x * pendingBisector.halfLength}
          y1={pendingBisector.origin.y - pendingBisector.dir.y * pendingBisector.halfLength}
          x2={pendingBisector.origin.x + pendingBisector.dir.x * pendingBisector.halfLength}
          y2={pendingBisector.origin.y + pendingBisector.dir.y * pendingBisector.halfLength}
          stroke={UI_TEAL}
          strokeWidth={2}
          strokeDasharray="8 6"
          vectorEffect="non-scaling-stroke"
        />
      )}

      {snapHit &&
        (snapHit.kind === 'vertex' ? (
          <circle
            cx={snapHit.point.x}
            cy={snapHit.point.y}
            r={px(7)}
            fill="none"
            stroke={UI_TEAL}
            strokeWidth={2.2}
            vectorEffect="non-scaling-stroke"
          />
        ) : (
          <rect
            x={snapHit.point.x - px(6)}
            y={snapHit.point.y - px(6)}
            width={px(12)}
            height={px(12)}
            fill="none"
            stroke={UI_TEAL}
            strokeWidth={2.2}
            vectorEffect="non-scaling-stroke"
          />
        ))}
    </g>
  );
}
