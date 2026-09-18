import { describe, expect, it } from 'vitest';
import { closestOnPolyline, closestPointOnSegment, hitTestPolylines } from '../closest';

describe('closestPointOnSegment', () => {
  it('proyección perpendicular dentro del segmento', () => {
    const c = closestPointOnSegment({ x: 5, y: 5 }, { x: 0, y: 0 }, { x: 10, y: 0 });
    expect(c.point).toEqual({ x: 5, y: 0 });
    expect(c.t).toBeCloseTo(0.5);
    expect(c.distance).toBeCloseTo(5);
  });
  it('se ancla al extremo cuando la proyección cae fuera', () => {
    const c = closestPointOnSegment({ x: -5, y: 3 }, { x: 0, y: 0 }, { x: 10, y: 0 });
    expect(c.point).toEqual({ x: 0, y: 0 });
    expect(c.t).toBe(0);
  });
  it('segmento degenerado (punto)', () => {
    const c = closestPointOnSegment({ x: 3, y: 4 }, { x: 0, y: 0 }, { x: 0, y: 0 });
    expect(c.distance).toBeCloseTo(5);
  });
});

describe('closestOnPolyline', () => {
  it('elige el segmento correcto', () => {
    const hit = closestOnPolyline({ x: 15, y: 3 }, [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 20, y: 0 },
    ]);
    expect(hit).not.toBeNull();
    expect(hit!.segIndex).toBe(1);
    expect(hit!.point.x).toBeCloseTo(15);
  });
});

describe('hitTestPolylines', () => {
  const candidates = [
    { id: 'a', points: [{ x: 0, y: 0 }, { x: 100, y: 0 }] },
    { id: 'b', points: [{ x: 0, y: 50 }, { x: 100, y: 50 }] },
  ];
  it('devuelve la línea más cercana dentro de tolerancia', () => {
    const hit = hitTestPolylines({ x: 50, y: 45 }, candidates, 10);
    expect(hit?.objectId).toBe('b');
  });
  it('null fuera de tolerancia', () => {
    expect(hitTestPolylines({ x: 50, y: 25 }, candidates, 10)).toBeNull();
  });
});
