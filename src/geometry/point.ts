import type { Point } from '../types';

export const dist = (a: Point, b: Point): number =>
  Math.hypot(b.x - a.x, b.y - a.y);

export const add = (a: Point, b: Point): Point => ({
  x: a.x + b.x,
  y: a.y + b.y,
});

export const sub = (a: Point, b: Point): Point => ({
  x: a.x - b.x,
  y: a.y - b.y,
});

export const scale = (p: Point, k: number): Point => ({
  x: p.x * k,
  y: p.y * k,
});

export const lerp = (a: Point, b: Point, t: number): Point => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
});

export const len = (p: Point): number => Math.hypot(p.x, p.y);

export const normalize = (p: Point): Point => {
  const l = len(p);
  if (l < 1e-12) return { x: 0, y: 0 };
  return { x: p.x / l, y: p.y / l };
};

export const eq = (a: Point, b: Point, eps = 1e-9): boolean =>
  Math.abs(a.x - b.x) <= eps && Math.abs(a.y - b.y) <= eps;

/** Elimina puntos consecutivos duplicados (mas cercanos que eps). */
export function dedupePoints(pts: Point[], eps = 1e-6): Point[] {
  const out: Point[] = [];
  for (const p of pts) {
    if (out.length === 0 || dist(out[out.length - 1], p) > eps) out.push(p);
  }
  return out;
}
