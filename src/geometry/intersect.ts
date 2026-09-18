import type { Fault, Horizon, Point } from '../types';

/**
 * Interseccion de segmentos a1->a2 y b1->b2.
 * Devuelve el punto y los parametros t sobre cada segmento, o null.
 */
export function segmentIntersection(
  a1: Point,
  a2: Point,
  b1: Point,
  b2: Point,
  eps = 1e-9,
): { point: Point; tA: number; tB: number } | null {
  const rX = a2.x - a1.x;
  const rY = a2.y - a1.y;
  const sX = b2.x - b1.x;
  const sY = b2.y - b1.y;
  const denom = rX * sY - rY * sX;
  if (Math.abs(denom) < eps) return null; // paralelos o colineales
  const qpX = b1.x - a1.x;
  const qpY = b1.y - a1.y;
  const tA = (qpX * sY - qpY * sX) / denom;
  const tB = (qpX * rY - qpY * rX) / denom;
  if (tA < -eps || tA > 1 + eps || tB < -eps || tB > 1 + eps) return null;
  const tAc = Math.max(0, Math.min(1, tA));
  return {
    point: { x: a1.x + rX * tAc, y: a1.y + rY * tAc },
    tA: tAc,
    tB: Math.max(0, Math.min(1, tB)),
  };
}

export interface PolylineIntersection {
  point: Point;
  aSeg: number;
  aT: number;
  bSeg: number;
  bT: number;
}

/** Todas las intersecciones entre dos polilineas. */
export function polylineIntersections(
  a: Point[],
  b: Point[],
): PolylineIntersection[] {
  const out: PolylineIntersection[] = [];
  for (let i = 0; i < a.length - 1; i++) {
    for (let j = 0; j < b.length - 1; j++) {
      const hit = segmentIntersection(a[i], a[i + 1], b[j], b[j + 1]);
      if (hit) {
        out.push({
          point: hit.point,
          aSeg: i,
          aT: hit.tA,
          bSeg: j,
          bT: hit.tB,
        });
      }
    }
  }
  return out;
}

export interface HorizonFaultCut {
  horizonId: string;
  faultId: string;
  point: Point;
}

/** Todas las intersecciones horizonte-falla (para el analisis de balance). */
export function findAllIntersections(
  horizons: Horizon[],
  faults: Fault[],
): HorizonFaultCut[] {
  const out: HorizonFaultCut[] = [];
  for (const h of horizons) {
    for (const f of faults) {
      for (const x of polylineIntersections(h.points, f.points)) {
        out.push({ horizonId: h.id, faultId: f.id, point: x.point });
      }
    }
  }
  return out;
}
