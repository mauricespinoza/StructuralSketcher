import type { Point, PolylineHit } from '../types';
import { dist } from './point';

export interface SegmentClosest {
  point: Point;
  t: number;
  distance: number;
}

/** Punto mas cercano a `p` sobre el segmento a->b. */
export function closestPointOnSegment(
  p: Point,
  a: Point,
  b: Point,
): SegmentClosest {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const l2 = dx * dx + dy * dy;
  let t = 0;
  if (l2 > 0) {
    t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2;
    t = Math.max(0, Math.min(1, t));
  }
  const point = { x: a.x + dx * t, y: a.y + dy * t };
  return { point, t, distance: dist(p, point) };
}

export interface PolylineClosest {
  point: Point;
  segIndex: number;
  t: number;
  distance: number;
}

/** Punto mas cercano a `p` sobre una polilinea completa. */
export function closestOnPolyline(
  p: Point,
  points: Point[],
): PolylineClosest | null {
  if (points.length < 2) return null;
  let best: PolylineClosest | null = null;
  for (let i = 0; i < points.length - 1; i++) {
    const c = closestPointOnSegment(p, points[i], points[i + 1]);
    if (!best || c.distance < best.distance) {
      best = { point: c.point, segIndex: i, t: c.t, distance: c.distance };
    }
  }
  return best;
}

/**
 * Hit-test de un punto contra varias polilineas; devuelve la mas cercana
 * dentro de la tolerancia (en unidades de mundo), o null.
 */
export function hitTestPolylines(
  p: Point,
  candidates: { id: string; points: Point[] }[],
  toleranceWorld: number,
): PolylineHit | null {
  let best: PolylineHit | null = null;
  for (const c of candidates) {
    const hit = closestOnPolyline(p, c.points);
    if (hit && hit.distance <= toleranceWorld) {
      if (!best || hit.distance < best.distance) {
        best = {
          objectId: c.id,
          point: hit.point,
          segIndex: hit.segIndex,
          t: hit.t,
          distance: hit.distance,
        };
      }
    }
  }
  return best;
}
