import type { Point } from '../types';
import { dist, normalize, sub } from './point';

export function polylineLength(points: Point[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += dist(points[i - 1], points[i]);
  }
  return total;
}

/**
 * Angulo del segmento p1->p2 respecto a la horizontal, en grados.
 * Positivo = hacia arriba en pantalla (y de mundo crece hacia abajo).
 * Rango [-180, 180].
 */
export function angleBetween(p1: Point, p2: Point): number {
  return (Math.atan2(-(p2.y - p1.y), p2.x - p1.x) * 180) / Math.PI;
}

/**
 * Direccion unitaria de la bisectriz del angulo en pB, formado por
 * los brazos pB->pA y pB->pC. Si los brazos son colineales (angulo llano)
 * devuelve la perpendicular al brazo pB->pA.
 */
export function bisector(pA: Point, pB: Point, pC: Point): Point {
  const u = normalize(sub(pA, pB));
  const v = normalize(sub(pC, pB));
  const sum = { x: u.x + v.x, y: u.y + v.y };
  const l = Math.hypot(sum.x, sum.y);
  if (l < 1e-9) return { x: -u.y, y: u.x };
  return { x: sum.x / l, y: sum.y / l };
}

/** Angulo interno (0-180 grados) en pB entre los brazos pB->pA y pB->pC. */
export function interiorAngle(pA: Point, pB: Point, pC: Point): number {
  const u = normalize(sub(pA, pB));
  const v = normalize(sub(pC, pB));
  const dot = Math.min(1, Math.max(-1, u.x * v.x + u.y * v.y));
  return (Math.acos(dot) * 180) / Math.PI;
}

/** Caja envolvente de una polilinea. */
export function bounds(points: Point[]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} | null {
  if (points.length === 0) return null;
  let minX = points[0].x,
    maxX = points[0].x,
    minY = points[0].y,
    maxY = points[0].y;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  return { minX, minY, maxX, maxY };
}

/** Muestrea n puntos equiespaciados por longitud de arco sobre la polilinea. */
export function samplePolyline(points: Point[], n: number): Point[] {
  if (points.length < 2 || n < 2) return points.slice();
  const total = polylineLength(points);
  if (total <= 0) return [points[0]];
  const out: Point[] = [];
  let target = 0;
  const step = total / (n - 1);
  let acc = 0;
  let i = 1;
  out.push(points[0]);
  target = step;
  while (out.length < n - 1 && i < points.length) {
    const segLen = dist(points[i - 1], points[i]);
    while (acc + segLen >= target && out.length < n - 1) {
      const t = segLen === 0 ? 0 : (target - acc) / segLen;
      out.push({
        x: points[i - 1].x + (points[i].x - points[i - 1].x) * t,
        y: points[i - 1].y + (points[i].y - points[i - 1].y) * t,
      });
      target += step;
    }
    acc += segLen;
    i++;
  }
  out.push(points[points.length - 1]);
  return out;
}
