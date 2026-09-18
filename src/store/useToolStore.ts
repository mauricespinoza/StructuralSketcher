import { create } from 'zustand';
import type { Point, SnapHit, SplitMode, ToolId } from '../types';
import { DEFAULT_SNAP_TOLERANCE_PX, STRAT_PALETTE } from '../constants';

export interface PendingBisector {
  /** vértice B (origen de la bisectriz) */
  origin: Point;
  /** dirección unitaria */
  dir: Point;
  /** semilongitud de la traza axial a materializar */
  halfLength: number;
}

export interface ToolStore {
  tool: ToolId;
  splitMode: SplitMode;
  snapEnabled: boolean;
  snapTolerancePx: number;
  currentColor: string;
  /** vértices fijados de la polilínea/regla/trazo en curso */
  drawing: Point[];
  cursorWorld: Point | null;
  snapHit: SnapHit | null;
  bisectorOn: boolean;
  pendingBisector: PendingBisector | null;
  /** primer objeto elegido en split por intersección */
  splitFirstId: string | null;

  setTool(tool: ToolId): void;
  setSplitMode(m: SplitMode): void;
  toggleSnap(): void;
  setCurrentColor(c: string): void;
  pushPoint(p: Point): void;
  clearDrawing(): void;
  setCursor(world: Point | null, snap: SnapHit | null): void;
  setBisectorOn(v: boolean): void;
  setPendingBisector(b: PendingBisector | null): void;
  setSplitFirstId(id: string | null): void;
}

export const useToolStore = create<ToolStore>()((set) => ({
  tool: 'select',
  splitMode: 'point',
  snapEnabled: true,
  snapTolerancePx: DEFAULT_SNAP_TOLERANCE_PX,
  currentColor: STRAT_PALETTE[0].color,
  drawing: [],
  cursorWorld: null,
  snapHit: null,
  bisectorOn: false,
  pendingBisector: null,
  splitFirstId: null,

  setTool: (tool) =>
    set({
      tool,
      drawing: [],
      pendingBisector: null,
      splitFirstId: null,
      snapHit: null,
    }),
  setSplitMode: (splitMode) => set({ splitMode, drawing: [], splitFirstId: null }),
  toggleSnap: () => set((s) => ({ snapEnabled: !s.snapEnabled })),
  setCurrentColor: (currentColor) => set({ currentColor }),
  pushPoint: (p) => set((s) => ({ drawing: [...s.drawing, p] })),
  clearDrawing: () =>
    set({ drawing: [], pendingBisector: null, splitFirstId: null }),
  setCursor: (cursorWorld, snapHit) => set({ cursorWorld, snapHit }),
  setBisectorOn: (bisectorOn) =>
    set((s) => ({ bisectorOn, pendingBisector: bisectorOn ? s.pendingBisector : null })),
  setPendingBisector: (pendingBisector) => set({ pendingBisector }),
  setSplitFirstId: (splitFirstId) => set({ splitFirstId }),
}));
