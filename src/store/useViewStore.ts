import { create } from 'zustand';
import type { Point, ViewTransform } from '../types';
import { MAX_ZOOM, MIN_ZOOM } from '../constants';

export interface ViewStore {
  view: ViewTransform;
  size: { w: number; h: number };
  gridVisible: boolean;

  setSize(w: number, h: number): void;
  setView(v: ViewTransform): void;
  panByScreen(dxPx: number, dyPx: number): void;
  /** Zoom manteniendo fijo el punto de pantalla dado. */
  zoomAt(screen: Point, factor: number): void;
  setGridVisible(v: boolean): void;
  toggleGrid(): void;
  resetView(): void;
}

const INITIAL_VIEW: ViewTransform = { x: -100, y: -100, zoom: 0.8 };

export const useViewStore = create<ViewStore>()((set) => ({
  view: { ...INITIAL_VIEW },
  size: { w: 800, h: 600 },
  gridVisible: true,

  setSize: (w, h) => set({ size: { w, h } }),
  setView: (view) => set({ view }),

  panByScreen: (dxPx, dyPx) =>
    set((s) => ({
      view: {
        ...s.view,
        x: s.view.x - dxPx / s.view.zoom,
        y: s.view.y - dyPx / s.view.zoom,
      },
    })),

  zoomAt: (screen, factor) =>
    set((s) => {
      const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, s.view.zoom * factor));
      if (zoom === s.view.zoom) return s;
      const worldX = s.view.x + screen.x / s.view.zoom;
      const worldY = s.view.y + screen.y / s.view.zoom;
      return {
        view: {
          zoom,
          x: worldX - screen.x / zoom,
          y: worldY - screen.y / zoom,
        },
      };
    }),

  setGridVisible: (gridVisible) => set({ gridVisible }),
  toggleGrid: () => set((s) => ({ gridVisible: !s.gridVisible })),
  resetView: () => set({ view: { ...INITIAL_VIEW } }),
}));
