import { describe, expect, it } from 'vitest';
import {
  splitPolylineAtIntersection,
  splitPolylineAtPoint,
  splitPolylineAtPositions,
  splitPolylineByTrace,
} from '../split';
import { polylineLength } from '../polyline';

const straight = [
  { x: 0, y: 0 },
  { x: 100, y: 0 },
];

describe('splitPolylineAtPoint', () => {
  it('divide en dos piezas que conservan la longitud total', () => {
    const pieces = splitPolylineAtPoint(straight, { x: 30, y: 5 });
    expect(pieces).toHaveLength(2);
    expect(pieces[0][pieces[0].length - 1].x).toBeCloseTo(30);
    const total = pieces.reduce((s, p) => s + polylineLength(p), 0);
    expect(total).toBeCloseTo(100);
  });
  it('corte en el extremo no divide', () => {
    const pieces = splitPolylineAtPoint(straight, { x: 0, y: 0 });
    expect(pieces).toHaveLength(1);
  });
});

describe('splitPolylineAtPositions', () => {
  it('varios cortes ordenados producen n+1 piezas', () => {
    const pieces = splitPolylineAtPositions(straight, [
      { segIndex: 0, t: 0.7, point: { x: 70, y: 0 } },
      { segIndex: 0, t: 0.2, point: { x: 20, y: 0 } },
    ]);
    expect(pieces).toHaveLength(3);
    expect(polylineLength(pieces[0])).toBeCloseTo(20);
    expect(polylineLength(pieces[1])).toBeCloseTo(50);
    expect(polylineLength(pieces[2])).toBeCloseTo(30);
  });
});

describe('splitPolylineByTrace', () => {
  it('corta donde cruza el trazo', () => {
    const trace = [
      { x: 50, y: -10 },
      { x: 50, y: 10 },
    ];
    const pieces = splitPolylineByTrace(straight, trace);
    expect(pieces).toHaveLength(2);
    expect(pieces[0][1].x).toBeCloseTo(50);
  });
  it('sin intersección devuelve la línea intacta', () => {
    const pieces = splitPolylineByTrace(straight, [
      { x: 200, y: -10 },
      { x: 200, y: 10 },
    ]);
    expect(pieces).toHaveLength(1);
  });
});

describe('splitPolylineAtIntersection', () => {
  it('corta ambas líneas en el punto de cruce', () => {
    const vertical = [
      { x: 40, y: -50 },
      { x: 40, y: 50 },
    ];
    const { piecesA, piecesB, cuts } = splitPolylineAtIntersection(
      straight,
      vertical,
    );
    expect(cuts).toHaveLength(1);
    expect(piecesA).toHaveLength(2);
    expect(piecesB).toHaveLength(2);
    expect(cuts[0].x).toBeCloseTo(40);
    expect(cuts[0].y).toBeCloseTo(0);
  });
});
