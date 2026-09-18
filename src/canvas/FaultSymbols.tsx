import type { Fault, Point } from '../types';
import { FAULT_COLOR } from '../constants';
import { dist } from '../geometry/point';

interface SymbolPos {
  point: Point;
  tangent: Point;
}

/** Posiciones equiespaciadas (ds en unidades de mundo) a lo largo de la polilínea. */
function walkPolyline(pts: Point[], ds: number): SymbolPos[] {
  const out: SymbolPos[] = [];
  if (pts.length < 2 || ds <= 0) return out;
  let next = ds * 0.6;
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const segLen = dist(a, b);
    if (segLen === 0) continue;
    const tx = (b.x - a.x) / segLen;
    const ty = (b.y - a.y) / segLen;
    while (next <= acc + segLen) {
      const t = (next - acc) / segLen;
      out.push({
        point: { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t },
        tangent: { x: tx, y: ty },
      });
      next += ds;
    }
    acc += segLen;
  }
  return out;
}

/**
 * Simbología estática de falla:
 * - inversa: dientes triangulares convencionales a un lado del trazo,
 * - normal: tics perpendiculares (lado del bloque hundido, convención simple).
 */
export function FaultSymbols({ fault, zoom }: { fault: Fault; zoom: number }) {
  const ds = 30 / zoom;
  const positions = walkPolyline(fault.points, ds);
  const size = 9 / zoom;
  const half = 5 / zoom;

  return (
    <g pointerEvents="none">
      {positions.map((s, i) => {
        // normal unitaria (lado izquierdo del sentido de digitalización)
        const nx = -s.tangent.y;
        const ny = s.tangent.x;
        if (fault.faultType === 'reverse') {
          const b1 = {
            x: s.point.x - s.tangent.x * half,
            y: s.point.y - s.tangent.y * half,
          };
          const b2 = {
            x: s.point.x + s.tangent.x * half,
            y: s.point.y + s.tangent.y * half,
          };
          const apex = { x: s.point.x + nx * size, y: s.point.y + ny * size };
          return (
            <polygon
              key={i}
              points={`${b1.x},${b1.y} ${b2.x},${b2.y} ${apex.x},${apex.y}`}
              fill={FAULT_COLOR}
            />
          );
        }
        const tip = { x: s.point.x + nx * size, y: s.point.y + ny * size };
        return (
          <line
            key={i}
            x1={s.point.x}
            y1={s.point.y}
            x2={tip.x}
            y2={tip.y}
            stroke={FAULT_COLOR}
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
    </g>
  );
}
