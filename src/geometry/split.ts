import type { Point } from '../types';
import { closestOnPolyline } from './closest';
import { dedupePoints, dist } from './point';
import { polylineIntersections } from './intersect';

export interface SplitPosition {
  segIndex: number;
  t: number;
  point: Point;
}

/**
 * Divide una polilínea en varias piezas en las posiciones dadas.
 * Las posiciones se ordenan a lo largo de la línea; los cortes en los
 * extremos o duplicados se ignoran. Cada pieza conserva >=2 puntos.
 */
export function splitPolylineAtPositions(
  points: Point[],
  positions: SplitPosition[],
  minPieceLength = 1e-6,
): Point[][] {
  if (points.length < 2 || positions.length === 0) return [points.slice()];

  const sorted = [...positions].sort(
    (a, b) => a.segIndex + a.t - (b.segIndex + b.t),
  );

  const pieces: Point[][] = [];
  let current: Point[] = [points[0]];
  let posIdx = 0;

  for (let i = 0; i < points.length - 1; i++) {
    const b = points[i + 1];
    // cortes dentro de este segmento, en orden
    while (posIdx < sorted.length && sorted[posIdx].segIndex === i) {
      const cut = sorted[posIdx].point;
      posIdx++;
      current.push(cut);
      const piece = dedupePoints(current);
      if (piece.length >= 2) pieces.push(piece);
      current = [cut];
    }
    current.push(b);
  }
  const last = dedupePoints(current);
  if (last.length >= 2) pieces.push(last);

  // filtra piezas degeneradas (longitud ~0)
  const valid = pieces.filter((p) => {
    let l = 0;
    for (let i = 1; i < p.length; i++) l += dist(p[i - 1], p[i]);
    return l > minPieceLength;
  });
  return valid.length > 0 ? valid : [points.slice()];
}

/** Divide una polilínea en el punto dado (proyectado a la línea). */
export function splitPolylineAtPoint(
  points: Point[],
  point: Point,
): Point[][] {
  const hit = closestOnPolyline(point, points);
  if (!hit) return [points.slice()];
  return splitPolylineAtPositions(points, [
    { segIndex: hit.segIndex, t: hit.t, point: hit.point },
  ]);
}

/** Divide `points` en cada intersección con el trazo `trace`. */
export function splitPolylineByTrace(
  points: Point[],
  trace: Point[],
): Point[][] {
  const xs = polylineIntersections(points, trace);
  if (xs.length === 0) return [points.slice()];
  return splitPolylineAtPositions(
    points,
    xs.map((x) => ({ segIndex: x.aSeg, t: x.aT, point: x.point })),
  );
}

/**
 * Divide ambas polilíneas en sus intersecciones mutuas.
 * Devuelve las piezas de A y de B.
 */
export function splitPolylineAtIntersection(
  a: Point[],
  b: Point[],
): { piecesA: Point[][]; piecesB: Point[][]; cuts: Point[] } {
  const xs = polylineIntersections(a, b);
  if (xs.length === 0) return { piecesA: [a.slice()], piecesB: [b.slice()], cuts: [] };
  const piecesA = splitPolylineAtPositions(
    a,
    xs.map((x) => ({ segIndex: x.aSeg, t: x.aT, point: x.point })),
  );
  const piecesB = splitPolylineAtPositions(
    b,
    xs.map((x) => ({ segIndex: x.bSeg, t: x.bT, point: x.point })),
  );
  return { piecesA, piecesB, cuts: xs.map((x) => x.point) };
}
