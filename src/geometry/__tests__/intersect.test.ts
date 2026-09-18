import { describe, expect, it } from 'vitest';
import { findAllIntersections, polylineIntersections, segmentIntersection } from '../intersect';
import type { Fault, Horizon } from '../../types';

describe('segmentIntersection', () => {
  it('cruz simple en el centro', () => {
    const hit = segmentIntersection(
      { x: 0, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
      { x: 10, y: 0 },
    );
    expect(hit).not.toBeNull();
    expect(hit!.point.x).toBeCloseTo(5);
    expect(hit!.point.y).toBeCloseTo(5);
  });
  it('segmentos que no se tocan -> null', () => {
    expect(
      segmentIntersection(
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 5 },
        { x: 1, y: 5 },
      ),
    ).toBeNull();
  });
  it('paralelos -> null', () => {
    expect(
      segmentIntersection(
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 0, y: 1 },
        { x: 10, y: 1 },
      ),
    ).toBeNull();
  });
});

describe('polylineIntersections', () => {
  it('zigzag cruza línea horizontal dos veces', () => {
    const a = [
      { x: 0, y: 5 },
      { x: 20, y: 5 },
    ];
    const b = [
      { x: 2, y: 10 },
      { x: 6, y: 0 },
      { x: 10, y: 10 },
    ];
    const xs = polylineIntersections(a, b);
    expect(xs).toHaveLength(2);
  });
});

describe('findAllIntersections', () => {
  it('detecta cortes horizonte-falla', () => {
    const h: Horizon = {
      id: 'h1',
      kind: 'horizon',
      layerId: 'interpretation',
      color: '#C1663C',
      points: [
        { x: 0, y: 100 },
        { x: 500, y: 100 },
      ],
    };
    const f: Fault = {
      id: 'f1',
      kind: 'fault',
      layerId: 'faults',
      faultType: 'reverse',
      points: [
        { x: 250, y: 0 },
        { x: 250, y: 300 },
      ],
    };
    const cuts = findAllIntersections([h], [f]);
    expect(cuts).toHaveLength(1);
    expect(cuts[0].point.x).toBeCloseTo(250);
    expect(cuts[0].horizonId).toBe('h1');
    expect(cuts[0].faultId).toBe('f1');
  });
});
