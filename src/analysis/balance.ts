import type { Fault, Horizon, Point } from '../types';
import { unitNameForColor } from '../constants';
import { closestOnPolyline } from '../geometry/closest';
import { findAllIntersections, type HorizonFaultCut } from '../geometry/intersect';
import { bounds, polylineLength, samplePolyline } from '../geometry/polyline';

export interface UnitBalance {
  color: string;
  unitName: string;
  count: number;
  totalLength: number;
  meanDepth: number;
  /** espesor medio hacia la unidad inmediatamente inferior; null si es la última */
  meanThicknessToNext: number | null;
  cuts: HorizonFaultCut[];
  xRange: [number, number];
}

export interface BalanceResult {
  units: UnitBalance[];
  intersections: HorizonFaultCut[];
}

function meanY(horizons: Horizon[]): number {
  let sum = 0;
  let n = 0;
  for (const h of horizons) {
    for (const p of h.points) {
      sum += p.y;
      n++;
    }
  }
  return n > 0 ? sum / n : 0;
}

/** Distancia mínima de un punto a cualquier polilínea del grupo. */
function distToGroup(p: Point, group: Horizon[]): number | null {
  let best: number | null = null;
  for (const h of group) {
    const hit = closestOnPolyline(p, h.points);
    if (hit && (best === null || hit.distance < best)) best = hit.distance;
  }
  return best;
}

/**
 * Deduplica cortes en la misma ubicación física: tras un split, las piezas
 * comparten el punto de corte y cada par pieza-falla lo reportaría de nuevo.
 */
function dedupeCuts(cuts: HorizonFaultCut[], tol = 1e-6): HorizonFaultCut[] {
  const out: HorizonFaultCut[] = [];
  for (const c of cuts) {
    const dup = out.some(
      (o) =>
        Math.abs(o.point.x - c.point.x) <= tol &&
        Math.abs(o.point.y - c.point.y) <= tol,
    );
    if (!dup) out.push(c);
  }
  return out;
}

/**
 * Balance por unidad geológica:
 * - agrupa horizontes por color/unidad,
 * - suma longitudes,
 * - estima espesor medio entre unidades adyacentes (muestreo de distancia
 *   perpendicular del grupo superior al inferior),
 * - lista cortes horizonte-falla.
 */
export function computeBalance(
  horizons: Horizon[],
  faults: Fault[],
  samples = 25,
): BalanceResult {
  const intersections = dedupeCuts(findAllIntersections(horizons, faults));

  const groups = new Map<string, Horizon[]>();
  for (const h of horizons) {
    if (h.points.length < 2) continue;
    const key = h.color.toLowerCase();
    const g = groups.get(key);
    if (g) g.push(h);
    else groups.set(key, [h]);
  }

  const ordered = [...groups.entries()]
    .map(([color, hs]) => ({ color, hs, depth: meanY(hs) }))
    .sort((a, b) => a.depth - b.depth); // y crece hacia abajo: más somero primero

  const units: UnitBalance[] = ordered.map((g, idx) => {
    const totalLength = g.hs.reduce((s, h) => s + polylineLength(h.points), 0);
    let minX = Infinity;
    let maxX = -Infinity;
    for (const h of g.hs) {
      const b = bounds(h.points);
      if (b) {
        minX = Math.min(minX, b.minX);
        maxX = Math.max(maxX, b.maxX);
      }
    }
    let meanThicknessToNext: number | null = null;
    const next = ordered[idx + 1];
    if (next) {
      const dists: number[] = [];
      for (const h of g.hs) {
        for (const p of samplePolyline(h.points, samples)) {
          const d = distToGroup(p, next.hs);
          if (d !== null) dists.push(d);
        }
      }
      if (dists.length > 0) {
        meanThicknessToNext =
          dists.reduce((s, d) => s + d, 0) / dists.length;
      }
    }
    const ids = new Set(g.hs.map((h) => h.id));
    return {
      color: g.hs[0].color,
      unitName: g.hs[0].unitName ?? unitNameForColor(g.hs[0].color),
      count: g.hs.length,
      totalLength,
      meanDepth: g.depth,
      meanThicknessToNext,
      cuts: intersections.filter((x) => ids.has(x.horizonId)),
      xRange: [
        minX === Infinity ? 0 : minX,
        maxX === -Infinity ? 0 : maxX,
      ] as [number, number],
    };
  });

  return { units, intersections };
}
