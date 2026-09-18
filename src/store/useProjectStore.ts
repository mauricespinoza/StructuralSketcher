import { create } from 'zustand';
import type {
  BackgroundImage,
  DrawnObject,
  Fault,
  FaultType,
  Horizon,
  LayerId,
  LayerState,
  Point,
  Project,
} from '../types';
import {
  DEFAULT_LAYERS,
  newId,
  UNDO_LIMIT,
  unitNameForColor,
} from '../constants';

interface Snapshot {
  horizons: Horizon[];
  faults: Fault[];
  image: BackgroundImage | null;
}

export interface ProjectStore {
  name: string;
  layers: LayerState[];
  horizons: Horizon[];
  faults: Fault[];
  image: BackgroundImage | null;
  selection: { objectId: string | null; activeFaultId: string | null };
  past: Snapshot[];
  future: Snapshot[];

  setName(name: string): void;
  addHorizon(points: Point[], color: string, layerId?: 'reference' | 'interpretation'): void;
  addHorizons(items: { points: Point[]; color: string; unitName?: string }[], layerId: 'reference' | 'interpretation'): void;
  addFault(points: Point[], faultType: FaultType): void;
  /** Reemplaza objetos (splits): elimina removeIds y agrega piezas nuevas. */
  replaceObjects(removeIds: string[], add: DrawnObject[]): void;
  removeObject(id: string): void;
  setObjectColor(id: string, color: string): void;
  select(id: string | null): void;
  setActiveFault(id: string | null): void;
  toggleLayerVisible(id: LayerId): void;
  toggleLayerLocked(id: LayerId): void;
  setImage(img: BackgroundImage | null): void;
  updateImage(partial: Partial<BackgroundImage>): void;
  undo(): void;
  redo(): void;
  loadProject(p: Project): void;
  resetProject(): void;

  getObject(id: string): DrawnObject | undefined;
}

function snapshot(s: ProjectStore): Snapshot {
  return { horizons: s.horizons, faults: s.faults, image: s.image };
}

function pushPast(s: ProjectStore): Pick<ProjectStore, 'past' | 'future'> {
  const past = [...s.past, snapshot(s)];
  if (past.length > UNDO_LIMIT) past.shift();
  return { past, future: [] };
}

export function serializeProject(s: ProjectStore, gridVisible: boolean): Project {
  return {
    schemaVersion: 1,
    name: s.name,
    layers: s.layers,
    horizons: s.horizons,
    faults: s.faults,
    image: s.image,
    gridVisible,
    selection: s.selection,
  };
}

export const useProjectStore = create<ProjectStore>()((set, get) => ({
  name: 'Sección sin título',
  layers: DEFAULT_LAYERS.map((l) => ({ ...l })),
  horizons: [],
  faults: [],
  image: null,
  selection: { objectId: null, activeFaultId: null },
  past: [],
  future: [],

  setName: (name) => set({ name }),

  addHorizon: (points, color, layerId = 'interpretation') =>
    set((s) => {
      if (points.length < 2) return s;
      const h: Horizon = {
        id: newId('h'),
        kind: 'horizon',
        layerId,
        points,
        color,
        unitName: unitNameForColor(color),
      };
      return { ...pushPast(s), horizons: [...s.horizons, h] };
    }),

  addHorizons: (items, layerId) =>
    set((s) => {
      const hs: Horizon[] = items
        .filter((it) => it.points.length >= 2)
        .map((it) => ({
          id: newId('h'),
          kind: 'horizon' as const,
          layerId,
          points: it.points,
          color: it.color,
          unitName: it.unitName ?? unitNameForColor(it.color),
        }));
      if (hs.length === 0) return s;
      return { ...pushPast(s), horizons: [...s.horizons, ...hs] };
    }),

  addFault: (points, faultType) =>
    set((s) => {
      if (points.length < 2) return s;
      const f: Fault = {
        id: newId('f'),
        kind: 'fault',
        layerId: 'faults',
        points,
        faultType,
      };
      return {
        ...pushPast(s),
        faults: [...s.faults, f],
        selection: { ...s.selection, activeFaultId: f.id },
      };
    }),

  replaceObjects: (removeIds, add) =>
    set((s) => {
      const rm = new Set(removeIds);
      const horizons = s.horizons.filter((h) => !rm.has(h.id));
      const faults = s.faults.filter((f) => !rm.has(f.id));
      for (const o of add) {
        if (o.kind === 'horizon') horizons.push(o);
        else faults.push(o);
      }
      const selection = { ...s.selection };
      if (selection.objectId && rm.has(selection.objectId)) selection.objectId = null;
      if (selection.activeFaultId && rm.has(selection.activeFaultId))
        selection.activeFaultId = null;
      return { ...pushPast(s), horizons, faults, selection };
    }),

  removeObject: (id) =>
    set((s) => {
      const horizons = s.horizons.filter((h) => h.id !== id);
      const faults = s.faults.filter((f) => f.id !== id);
      if (horizons.length === s.horizons.length && faults.length === s.faults.length)
        return s;
      const selection = { ...s.selection };
      if (selection.objectId === id) selection.objectId = null;
      if (selection.activeFaultId === id) selection.activeFaultId = null;
      return { ...pushPast(s), horizons, faults, selection };
    }),

  setObjectColor: (id, color) =>
    set((s) => {
      const idx = s.horizons.findIndex((h) => h.id === id);
      if (idx < 0) return s;
      const horizons = s.horizons.slice();
      horizons[idx] = {
        ...horizons[idx],
        color,
        unitName: unitNameForColor(color),
      };
      return { ...pushPast(s), horizons };
    }),

  select: (id) =>
    set((s) => {
      const fault = id ? s.faults.find((f) => f.id === id) : undefined;
      return {
        selection: {
          objectId: id,
          activeFaultId: fault ? fault.id : s.selection.activeFaultId,
        },
      };
    }),

  setActiveFault: (id) =>
    set((s) => ({ selection: { ...s.selection, activeFaultId: id } })),

  toggleLayerVisible: (id) =>
    set((s) => ({
      layers: s.layers.map((l) =>
        l.id === id ? { ...l, visible: !l.visible } : l,
      ),
    })),

  toggleLayerLocked: (id) =>
    set((s) => ({
      layers: s.layers.map((l) =>
        l.id === id ? { ...l, locked: !l.locked } : l,
      ),
    })),

  setImage: (image) => set((s) => ({ ...pushPast(s), image })),

  updateImage: (partial) =>
    set((s) => (s.image ? { image: { ...s.image, ...partial } } : s)),

  undo: () =>
    set((s) => {
      const prev = s.past[s.past.length - 1];
      if (!prev) return s;
      return {
        past: s.past.slice(0, -1),
        future: [snapshot(s), ...s.future],
        horizons: prev.horizons,
        faults: prev.faults,
        image: prev.image,
        selection: { objectId: null, activeFaultId: null },
      };
    }),

  redo: () =>
    set((s) => {
      const next = s.future[0];
      if (!next) return s;
      return {
        future: s.future.slice(1),
        past: [...s.past, snapshot(s)],
        horizons: next.horizons,
        faults: next.faults,
        image: next.image,
        selection: { objectId: null, activeFaultId: null },
      };
    }),

  loadProject: (p) =>
    set({
      name: p.name,
      layers: p.layers?.length ? p.layers : DEFAULT_LAYERS.map((l) => ({ ...l })),
      horizons: p.horizons ?? [],
      faults: p.faults ?? [],
      image: p.image ?? null,
      selection: p.selection ?? { objectId: null, activeFaultId: null },
      past: [],
      future: [],
    }),

  resetProject: () =>
    set({
      name: 'Sección sin título',
      layers: DEFAULT_LAYERS.map((l) => ({ ...l })),
      horizons: [],
      faults: [],
      image: null,
      selection: { objectId: null, activeFaultId: null },
      past: [],
      future: [],
    }),

  getObject: (id) => {
    const s = get();
    return s.horizons.find((h) => h.id === id) ?? s.faults.find((f) => f.id === id);
  },
}));
