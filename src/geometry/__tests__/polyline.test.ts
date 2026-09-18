import { describe, expect, it } from 'vitest';
import { angleBetween, bisector, interiorAngle, polylineLength, samplePolyline } from '../polyline';

describe('polylineLength', () => {
  it('suma segmentos', () => {
    expect(
      polylineLength([
        { x: 0, y: 0 },
        { x: 3, y: 4 },
        { x: 3, y: 14 },
      ]),
    ).toBeCloseTo(15);
  });
  it('devuelve 0 con <2 puntos', () => {
    expect(polylineLength([{ x: 1, y: 1 }])).toBe(0);
  });
});

describe('angleBetween', () => {
  it('horizontal -> 0 grados', () => {
    expect(angleBetween({ x: 0, y: 0 }, { x: 10, y: 0 })).toBeCloseTo(0);
  });
  it('subiendo en pantalla (y menor) -> +45 grados', () => {
    expect(angleBetween({ x: 0, y: 0 }, { x: 10, y: -10 })).toBeCloseTo(45);
  });
  it('bajando -> -90 grados', () => {
    expect(angleBetween({ x: 0, y: 0 }, { x: 0, y: 10 })).toBeCloseTo(-90);
  });
});

describe('bisector', () => {
  it('ángulo recto en B -> bisectriz a 45 grados', () => {
    // brazos hacia +x y hacia +y desde B=(0,0)
    const d = bisector({ x: 10, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 10 });
    expect(d.x).toBeCloseTo(Math.SQRT1_2);
    expect(d.y).toBeCloseTo(Math.SQRT1_2);
  });
  it('brazos colineales -> perpendicular', () => {
    const d = bisector({ x: -10, y: 0 }, { x: 0, y: 0 }, { x: 10, y: 0 });
    expect(Math.abs(d.y)).toBeCloseTo(1);
  });
});

describe('interiorAngle', () => {
  it('ángulo recto = 90 grados', () => {
    expect(
      interiorAngle({ x: 10, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 10 }),
    ).toBeCloseTo(90);
  });
});

describe('samplePolyline', () => {
  it('muestrea extremos y puntos intermedios equiespaciados', () => {
    const s = samplePolyline(
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ],
      5,
    );
    expect(s).toHaveLength(5);
    expect(s[0]).toEqual({ x: 0, y: 0 });
    expect(s[4]).toEqual({ x: 10, y: 0 });
    expect(s[2].x).toBeCloseTo(5);
  });
});
