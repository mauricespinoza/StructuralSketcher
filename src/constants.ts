import type { LayerState } from './types';

/** Paleta estratigrafica por defecto */
export const STRAT_PALETTE: { name: string; color: string }[] = [
  { name: 'Terracota', color: '#C1663C' },
  { name: 'Ocre', color: '#D9A441' },
  { name: 'Verde', color: '#5F8C5A' },
  { name: 'Azul', color: '#4A7BA6' },
  { name: 'Violeta', color: '#7E5A9B' },
];

export const FAULT_COLOR = '#C43B3B';
export const UI_TEAL = '#2a7f7f';
export const UI_GRAPHITE = '#34383c';

export const DEFAULT_LAYERS: LayerState[] = [
  { id: 'reference', name: 'Referencia', visible: true, locked: false },
  { id: 'interpretation', name: 'Interpretación', visible: true, locked: false },
  { id: 'faults', name: 'Fallas', visible: true, locked: false },
];

export const MIN_ZOOM = 0.02; // px por metro
export const MAX_ZOOM = 400;
export const DEFAULT_SNAP_TOLERANCE_PX = 12;
export const HIT_TOLERANCE_PX = 14;
export const TAP_MOVE_TOLERANCE_PX = 7;
export const DOUBLE_TAP_MS = 350;
export const DOUBLE_TAP_DIST_PX = 18;
export const UNDO_LIMIT = 50;
export const AUTOSAVE_KEY = 'faultdraw:project:v1';
export const AUTOSAVE_DEBOUNCE_MS = 800;

export function unitNameForColor(color: string): string {
  const hit = STRAT_PALETTE.find(
    (p) => p.color.toLowerCase() === color.toLowerCase(),
  );
  return hit ? hit.name : color;
}

let idCounter = 0;
export function newId(prefix: string): string {
  idCounter += 1;
  return `${prefix}_${Date.now().toString(36)}_${idCounter.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
