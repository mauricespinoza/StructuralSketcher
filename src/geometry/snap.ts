import type { Point, SnapHit } from '../types';
import { closestOnPolyline } from './closest';
import { dist } from './point';

export interface SnapCandidate {
  id: string;
  points: Point[];
}

/**
 * Resuelve el snap del cursor contra la geometría candidata.
 * Prioridad: vértice > segmento. Tolerancia en unidades de mundo
 * (el llamador convierte px de pantalla a mundo dividiendo por zoom).
 */
export function resolveSnap(
  cursor: Point,
  candidates: SnapCandidate[],
  toleranceWorld: number,
): SnapHit | null {
  let bestVertex: SnapHit | null = null;
  let bestVertexDist = Infinity;
  let bestSegment: SnapHit | null = null;
  let bestSegmentDist = Infinity;

  for (const c of candidates) {
    for (const v of c.points) {
      const d = dist(cursor, v);
      if (d <= toleranceWorld && d < bestVertexDist) {
        bestVertexDist = d;
        bestVertex = { point: v, kind: 'vertex', objectId: c.id };
      }
    }
    if (c.points.length >= 2) {
      const hit = closestOnPolyline(cursor, c.points);
      if (hit && hit.distance <= toleranceWorld && hit.distance < bestSegmentDist) {
        bestSegmentDist = hit.distance;
        bestSegment = { point: hit.point, kind: 'segment', objectId: c.id };
      }
    }
  }
  return bestVertex ?? bestSegment;
}
