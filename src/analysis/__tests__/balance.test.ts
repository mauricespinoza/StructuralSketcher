import { describe, expect, it } from 'vitest';
import { computeBalance } from '../balance';
import type { Fault, Horizon } from '../../types';

const mkHorizon = (id: string, pts: [number, number][], color = '#C1663C'): Horizon => ({
  id,
  kind: 'horizon',
  layerId: 'interpretation',
  color,
  points: pts.map(([x, y]) => ({ x, y })),
});

const mkFault = (id: string, pts: [number, number][]): Fault => ({
  id,
  kind: 'fault',
  layerId: 'faults',
  faultType: 'reverse',
  points: pts.map(([x, y]) => ({ x, y })),
});

describe('computeBalance', () => {
  it('suma longitudes por color y ordena somero a profundo', () => {
    const upper = mkHorizon('h1', [[0, 100], [500, 100]], '#C1663C');
    const lower = mkHorizon('h2', [[0, 300], [500, 300]], '#D9A441');
    const { units } = computeBalance([upper, lower], []);
    expect(units).toHaveLength(2);
    expect(units[0].color).toBe('#C1663C'); // más somero (y menor)
    expect(units[0].totalLength).toBeCloseTo(500);
    expect(units[0].meanThicknessToNext).toBeCloseTo(200, 0);
    expect(units[1].meanThicknessToNext).toBeNull();
  });

  it('deduplica cortes en el mismo punto físico tras un split', () => {
    // horizonte partido en dos piezas que comparten el punto (250,100),
    // falla también partida en dos piezas que comparten ese punto
    const hA = mkHorizon('hA', [[0, 100], [250, 100]]);
    const hB = mkHorizon('hB', [[250, 100], [500, 100]]);
    const fA = mkFault('fA', [[250, 0], [250, 100]]);
    const fB = mkFault('fB', [[250, 100], [250, 300]]);
    const { units, intersections } = computeBalance([hA, hB], [fA, fB]);
    expect(intersections).toHaveLength(1);
    expect(units[0].cuts).toHaveLength(1);
    expect(units[0].totalLength).toBeCloseTo(500);
  });

  it('cuenta cortes distintos en ubicaciones distintas', () => {
    const h = mkHorizon('h1', [[0, 100], [500, 100]]);
    const f1 = mkFault('f1', [[100, 0], [100, 300]]);
    const f2 = mkFault('f2', [[400, 0], [400, 300]]);
    const { intersections } = computeBalance([h], [f1, f2]);
    expect(intersections).toHaveLength(2);
  });
});
