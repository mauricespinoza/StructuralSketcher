import { useEffect, useRef } from 'react';
import type { Point } from '../types';
import {
  DOUBLE_TAP_DIST_PX,
  DOUBLE_TAP_MS,
  TAP_MOVE_TOLERANCE_PX,
} from '../constants';
import { eventToScreen, screenToWorld } from './coords';
import {
  cancelDrawing,
  deleteSelection,
  finishDrawing,
  handleMove,
  handleTap,
} from '../tools/actions';
import { useProjectStore } from '../store/useProjectStore';
import { useToolStore } from '../store/useToolStore';
import { useViewStore } from '../store/useViewStore';

interface PointerInfo {
  id: number;
  start: Point;
  last: Point;
  moved: boolean;
  inGesture: boolean; // participó en pinch/pan: no genera tap
  button: number;
  pointerType: string;
}

/**
 * Unifica mouse / touch / teclado sobre el lienzo SVG:
 * - tap (clic o toque corto): vértice / selección / corte
 * - doble tap / doble clic / Enter / clic secundario: cerrar polilínea
 * - rueda o pinch de dos dedos: zoom; dos dedos, botón central,
 *   espacio+arrastre o herramienta pan: paneo
 */
export function useCanvasInteraction(
  svgRef: React.RefObject<SVGSVGElement | null>,
  containerRef: React.RefObject<HTMLDivElement | null>,
) {
  const state = useRef({
    pointers: new Map<number, PointerInfo>(),
    pinchPrev: null as { a: Point; b: Point } | null,
    panning: false,
    spaceHeld: false,
    lastTap: { time: 0, screen: { x: 0, y: 0 } as Point },
  });

  useEffect(() => {
    const svg = svgRef.current;
    const container = containerRef.current;
    if (!svg || !container) return;
    const st = state.current;

    const toWorld = (e: { clientX: number; clientY: number }): Point =>
      screenToWorld(eventToScreen(e, svg), useViewStore.getState().view);

    // --- tamaño del lienzo ---
    const ro = new ResizeObserver(() => {
      const r = container.getBoundingClientRect();
      useViewStore.getState().setSize(r.width, r.height);
    });
    ro.observe(container);
    const r0 = container.getBoundingClientRect();
    useViewStore.getState().setSize(r0.width, r0.height);

    // --- pointer events ---
    const onPointerDown = (e: PointerEvent) => {
      try {
        svg.setPointerCapture?.(e.pointerId);
      } catch {
        // punteros sintéticos (tests) no se pueden capturar
      }
      const screen = eventToScreen(e, svg);
      const info: PointerInfo = {
        id: e.pointerId,
        start: screen,
        last: screen,
        moved: false,
        inGesture: false,
        button: e.button,
        pointerType: e.pointerType,
      };
      st.pointers.set(e.pointerId, info);

      const tool = useToolStore.getState().tool;
      const panIntent =
        tool === 'pan' || st.spaceHeld || e.button === 1;

      if (st.pointers.size === 2) {
        // inicia pinch: ambos punteros quedan marcados como gesto
        const [p1, p2] = [...st.pointers.values()];
        p1.inGesture = true;
        p2.inGesture = true;
        st.pinchPrev = { a: p1.last, b: p2.last };
        st.panning = false;
      } else if (st.pointers.size === 1 && panIntent) {
        st.panning = true;
        info.inGesture = true;
      }
      if (e.button === 1) e.preventDefault();
    };

    const onPointerMove = (e: PointerEvent) => {
      const screen = eventToScreen(e, svg);
      const info = st.pointers.get(e.pointerId);
      const view = useViewStore.getState();

      if (info) {
        const dx = screen.x - info.last.x;
        const dy = screen.y - info.last.y;
        if (
          Math.hypot(screen.x - info.start.x, screen.y - info.start.y) >
          TAP_MOVE_TOLERANCE_PX
        ) {
          info.moved = true;
        }
        info.last = screen;

        if (st.pointers.size === 2 && st.pinchPrev) {
          const [p1, p2] = [...st.pointers.values()];
          const prev = st.pinchPrev;
          const prevDist = Math.hypot(prev.b.x - prev.a.x, prev.b.y - prev.a.y);
          const newDist = Math.hypot(p2.last.x - p1.last.x, p2.last.y - p1.last.y);
          const prevC = { x: (prev.a.x + prev.b.x) / 2, y: (prev.a.y + prev.b.y) / 2 };
          const newC = {
            x: (p1.last.x + p2.last.x) / 2,
            y: (p1.last.y + p2.last.y) / 2,
          };
          if (prevDist > 0 && newDist > 0) {
            view.zoomAt(prevC, newDist / prevDist);
          }
          view.panByScreen(newC.x - prevC.x, newC.y - prevC.y);
          st.pinchPrev = { a: p1.last, b: p2.last };
          return;
        }

        if (st.panning) {
          view.panByScreen(dx, dy);
          return;
        }
      }

      // hover / rubber band
      handleMove(toWorld(e));
    };

    const endPointer = (e: PointerEvent) => {
      const info = st.pointers.get(e.pointerId);
      st.pointers.delete(e.pointerId);
      if (st.pointers.size < 2) st.pinchPrev = null;
      if (st.pointers.size === 0) st.panning = false;
      if (!info) return;

      const isTap =
        !info.moved && !info.inGesture && (info.button === 0 || info.pointerType !== 'mouse');
      if (!isTap) return;

      const now = performance.now();
      const screen = info.last;
      const dt = now - st.lastTap.time;
      const dd = Math.hypot(
        screen.x - st.lastTap.screen.x,
        screen.y - st.lastTap.screen.y,
      );
      st.lastTap = { time: now, screen };

      if (dt < DOUBLE_TAP_MS && dd < DOUBLE_TAP_DIST_PX) {
        // doble tap / doble clic: cerrar
        finishDrawing();
        return;
      }
      handleTap(
        screenToWorld(screen, useViewStore.getState().view),
      );
    };

    const onPointerCancel = (e: PointerEvent) => {
      st.pointers.delete(e.pointerId);
      if (st.pointers.size < 2) st.pinchPrev = null;
      if (st.pointers.size === 0) st.panning = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const screen = eventToScreen(e, svg);
      const base = e.ctrlKey ? 1.01 : 1.0015;
      const factor = Math.pow(base, -e.deltaY);
      useViewStore.getState().zoomAt(screen, factor);
      handleMove(toWorld(e));
    };

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      finishDrawing();
    };

    const onDblClick = (e: MouseEvent) => e.preventDefault();

    // tap fuera del lienzo cierra el gesto en curso
    const onDocPointerDown = (e: PointerEvent) => {
      if (useToolStore.getState().drawing.length === 0) return;
      const target = e.target as Element | null;
      if (!target) return;
      if (svg.contains(target)) return;
      if (target.closest('[data-keep-drawing]')) return;
      finishDrawing();
    };

    const isTypingTarget = (t: EventTarget | null) =>
      t instanceof HTMLElement &&
      (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);

    const onKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      if (e.code === 'Space') {
        st.spaceHeld = true;
        return;
      }
      if (e.key === 'Enter') {
        finishDrawing();
      } else if (e.key === 'Escape') {
        cancelDrawing();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelection();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) useProjectStore.getState().redo();
        else useProjectStore.getState().undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        useProjectStore.getState().redo();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') st.spaceHeld = false;
    };

    svg.addEventListener('pointerdown', onPointerDown);
    svg.addEventListener('pointermove', onPointerMove);
    svg.addEventListener('pointerup', endPointer);
    svg.addEventListener('pointercancel', onPointerCancel);
    svg.addEventListener('wheel', onWheel, { passive: false });
    svg.addEventListener('contextmenu', onContextMenu);
    svg.addEventListener('dblclick', onDblClick);
    document.addEventListener('pointerdown', onDocPointerDown, true);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      ro.disconnect();
      svg.removeEventListener('pointerdown', onPointerDown);
      svg.removeEventListener('pointermove', onPointerMove);
      svg.removeEventListener('pointerup', endPointer);
      svg.removeEventListener('pointercancel', onPointerCancel);
      svg.removeEventListener('wheel', onWheel);
      svg.removeEventListener('contextmenu', onContextMenu);
      svg.removeEventListener('dblclick', onDblClick);
      document.removeEventListener('pointerdown', onDocPointerDown, true);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [svgRef, containerRef]);
}
