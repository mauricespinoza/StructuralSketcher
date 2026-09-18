import { useViewStore } from '../store/useViewStore';
import { niceStep } from './coords';

/** Grilla adaptativa (pasos 1-2-5) con ejes de origen destacados. */
export function GridLayer() {
  const view = useViewStore((s) => s.view);
  const size = useViewStore((s) => s.size);

  const step = niceStep(80 / view.zoom);
  const worldW = size.w / view.zoom;
  const worldH = size.h / view.zoom;
  const x0 = Math.floor(view.x / step) * step;
  const y0 = Math.floor(view.y / step) * step;

  const vLines: number[] = [];
  for (let x = x0; x <= view.x + worldW + step; x += step) vLines.push(x);
  const hLines: number[] = [];
  for (let y = y0; y <= view.y + worldH + step; y += step) hLines.push(y);

  return (
    <g pointerEvents="none">
      {vLines.map((x) => (
        <line
          key={`v${x}`}
          x1={x}
          y1={view.y}
          x2={x}
          y2={view.y + worldH}
          stroke={Math.abs(x) < step / 2 ? '#b9c0c4' : '#e4e8ea'}
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
      ))}
      {hLines.map((y) => (
        <line
          key={`h${y}`}
          x1={view.x}
          y1={y}
          x2={view.x + worldW}
          y2={y}
          stroke={Math.abs(y) < step / 2 ? '#b9c0c4' : '#e4e8ea'}
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </g>
  );
}
