import { describe, expect, it } from 'vitest';
import { resolveSnap } from '../snap';

const candidates = [
  {
    id: 'line1',
    points: [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
    ],
  },
];

describe('resolveSnap', () => {
  it('prioriza vértice sobre segmento', () => {
    // cerca del vértice (0,0) y también del segmento
    const hit = resolveSnap({ x: 3, y: 4 }, candidates, 10);
    expect(hit?.kind).toBe('vertex');
    expect(hit?.point).toEqual({ x: 0, y: 0 });
  });
  it('cae a segmento lejos de vértices', () => {
    const hit = resolveSnap({ x: 50, y: 6 }, candidates, 10);
    expect(hit?.kind).toBe('segment');
    expect(hit?.point.x).toBeCloseTo(50);
    expect(hit?.point.y).toBeCloseTo(0);
  });
  it('null fuera de tolerancia', () => {
    expect(resolveSnap({ x: 50, y: 30 }, candidates, 10)).toBeNull();
  });
});
