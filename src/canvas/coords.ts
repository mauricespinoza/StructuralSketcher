import type { Point, ViewTransform } from '../types';

export function screenToWorld(screen: Point, view: ViewTransform): Point {
  return {
    x: view.x + screen.x / view.zoom,
    y: view.y + screen.y / view.zoom,
  };
}

export function worldToScreen(world: Point, view: ViewTransform): Point {
  return {
    x: (world.x - view.x) * view.zoom,
    y: (world.y - view.y) * view.zoom,
  };
}

/** Posición del evento en px relativos al elemento SVG. */
export function eventToScreen(
  e: { clientX: number; clientY: number },
  el: Element,
): Point {
  const rect = el.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

export function formatMeters(m: number): string {
  if (Math.abs(m) >= 1000) return `${(m / 1000).toFixed(m % 1000 === 0 ? 0 : 1)} km`;
  if (Math.abs(m) >= 1) return `${m.toFixed(m % 1 === 0 ? 0 : 1)} m`;
  return `${(m * 100).toFixed(0)} cm`;
}

/** Paso "bonito" 1-2-5 más cercano por debajo/igual a target. */
export function niceStep(target: number): number {
  const pow = Math.pow(10, Math.floor(Math.log10(target)));
  const r = target / pow;
  if (r >= 5) return 5 * pow;
  if (r >= 2) return 2 * pow;
  return pow;
}
