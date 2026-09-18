import type { DrawnObject, Fault, Horizon, Point, SnapHit } from '../types';
import { HIT_TOLERANCE_PX, newId } from '../constants';
import { hitTestPolylines } from '../geometry/closest';
import { dedupePoints } from '../geometry/point';
import { bisector } from '../geometry/polyline';
import { resolveSnap, type SnapCandidate } from '../geometry/snap';
import {
  splitPolylineAtIntersection,
  splitPolylineAtPositions,
  splitPolylineByTrace,
} from '../geometry/split';
import { closestOnPolyline } from '../geometry/closest';
import { useProjectStore } from '../store/useProjectStore';
import { useToolStore } from '../store/useToolStore';
import { useViewStore } from '../store/useViewStore';

/** Objetos con los que se puede interactuar (capa visible y desbloqueada). */
function interactableObjects(): DrawnObject[] {
  const s = useProjectStore.getState();
  const layerOk = new Map(
    s.layers.map((l) => [l.id, l.visible && !l.locked] as const),
  );
  return [
    ...s.horizons.filter((h) => layerOk.get(h.layerId)),
    ...s.faults.filter((f) => layerOk.get(f.layerId)),
  ];
}

/** Candidatos de snap: todo lo visible (aunque esté bloqueado) + dibujo en curso. */
function snapCandidates(): SnapCandidate[] {
  const s = useProjectStore.getState();
  const t = useToolStore.getState();
  const visible = new Map(s.layers.map((l) => [l.id, l.visible] as const));
  const out: SnapCandidate[] = [];
  for (const h of s.horizons)
    if (visible.get(h.layerId)) out.push({ id: h.id, points: h.points });
  for (const f of s.faults)
    if (visible.get(f.layerId)) out.push({ id: f.id, points: f.points });
  if (t.drawing.length > 1) {
    // permite cerrar contra los vértices ya fijados (excepto el último)
    out.push({ id: '__drawing__', points: t.drawing.slice(0, -1) });
  }
  return out;
}

function toleranceWorld(px: number): number {
  return px / useViewStore.getState().view.zoom;
}

export function computeSnap(world: Point): SnapHit | null {
  const t = useToolStore.getState();
  if (!t.snapEnabled) return null;
  return resolveSnap(world, snapCandidates(), toleranceWorld(t.snapTolerancePx));
}

/** Movimiento del cursor: actualiza posición + indicador de snap + bisectriz. */
export function handleMove(world: Point): void {
  const t = useToolStore.getState();
  const snappable =
    t.tool === 'horizon' ||
    t.tool === 'faultReverse' ||
    t.tool === 'faultNormal' ||
    t.tool === 'ruler' ||
    t.tool === 'split';
  const snap = snappable ? computeSnap(world) : null;
  t.setCursor(world, snap);

  // bisectriz auxiliar de la regla: entre los dos últimos puntos fijados y el cursor
  if (t.tool === 'ruler' && t.bisectorOn && t.drawing.length >= 2) {
    const cursor = snap?.point ?? world;
    const pA = t.drawing[t.drawing.length - 2];
    const pB = t.drawing[t.drawing.length - 1];
    const dir = bisector(pA, pB, cursor);
    const lenBA = Math.hypot(pA.x - pB.x, pA.y - pB.y);
    const lenBC = Math.hypot(cursor.x - pB.x, cursor.y - pB.y);
    t.setPendingBisector({
      origin: pB,
      dir,
      halfLength: Math.max(1e-6, (lenBA + lenBC) / 2),
    });
  } else if (t.pendingBisector && (t.tool !== 'ruler' || t.drawing.length < 2)) {
    t.setPendingBisector(null);
  }
}

/** Tap/clic primario sobre el lienzo. */
export function handleTap(world: Point): void {
  const t = useToolStore.getState();
  const snapped = computeSnap(world)?.point ?? world;

  switch (t.tool) {
    case 'horizon':
    case 'faultReverse':
    case 'faultNormal':
    case 'ruler':
      t.pushPoint(snapped);
      break;
    case 'select':
      doSelect(world);
      break;
    case 'split':
      handleSplitTap(world, snapped);
      break;
    case 'pan':
      break;
  }
}

function doSelect(world: Point): void {
  const p = useProjectStore.getState();
  const hit = hitTestPolylines(
    world,
    interactableObjects().map((o) => ({ id: o.id, points: o.points })),
    toleranceWorld(HIT_TOLERANCE_PX),
  );
  p.select(hit ? hit.objectId : null);
}

function handleSplitTap(world: Point, _snapped: Point): void {
  const t = useToolStore.getState();
  const p = useProjectStore.getState();
  const candidates = interactableObjects();

  if (t.splitMode === 'trace') {
    t.pushPoint(_snapped);
    return;
  }

  const hit = hitTestPolylines(
    world,
    candidates.map((o) => ({ id: o.id, points: o.points })),
    toleranceWorld(HIT_TOLERANCE_PX),
  );
  if (!hit) {
    if (t.splitMode === 'intersection') t.setSplitFirstId(null);
    return;
  }

  if (t.splitMode === 'point') {
    const obj = p.getObject(hit.objectId);
    if (!obj) return;
    const pieces = splitPolylineAtPositions(obj.points, [
      { segIndex: hit.segIndex, t: hit.t, point: hit.point },
    ]);
    if (pieces.length > 1) {
      p.replaceObjects([obj.id], pieces.map((pts) => cloneWithPoints(obj, pts)));
    }
    return;
  }

  // intersection: primer tap elige A, segundo tap elige B y corta ambos
  if (t.splitMode === 'intersection') {
    if (!t.splitFirstId) {
      t.setSplitFirstId(hit.objectId);
      return;
    }
    if (t.splitFirstId === hit.objectId) return;
    const objA = p.getObject(t.splitFirstId);
    const objB = p.getObject(hit.objectId);
    t.setSplitFirstId(null);
    if (!objA || !objB) return;
    const { piecesA, piecesB, cuts } = splitPolylineAtIntersection(
      objA.points,
      objB.points,
    );
    if (cuts.length === 0) return;
    const add: DrawnObject[] = [
      ...(piecesA.length > 1 ? piecesA.map((pts) => cloneWithPoints(objA, pts)) : []),
      ...(piecesB.length > 1 ? piecesB.map((pts) => cloneWithPoints(objB, pts)) : []),
    ];
    const remove = [
      ...(piecesA.length > 1 ? [objA.id] : []),
      ...(piecesB.length > 1 ? [objB.id] : []),
    ];
    if (remove.length > 0) p.replaceObjects(remove, add);
  }
}

function cloneWithPoints(obj: DrawnObject, points: Point[]): DrawnObject {
  if (obj.kind === 'horizon') {
    const h: Horizon = { ...obj, id: newId('h'), points };
    return h;
  }
  const f: Fault = { ...obj, id: newId('f'), points };
  return f;
}

/** Cierra el gesto en curso (Enter, doble clic/tap, clic secundario, tap fuera). */
export function finishDrawing(): void {
  const t = useToolStore.getState();
  const p = useProjectStore.getState();
  const pts = dedupePoints(t.drawing, 1e-9);

  switch (t.tool) {
    case 'horizon':
      if (pts.length >= 2) p.addHorizon(pts, t.currentColor);
      break;
    case 'faultReverse':
      if (pts.length >= 2) p.addFault(pts, 'reverse');
      break;
    case 'faultNormal':
      if (pts.length >= 2) p.addFault(pts, 'normal');
      break;
    case 'split':
      if (t.splitMode === 'trace' && pts.length >= 2) applyTraceSplit(pts);
      break;
    case 'ruler':
      break;
  }
  t.clearDrawing();
}

function applyTraceSplit(trace: Point[]): void {
  const p = useProjectStore.getState();
  const remove: string[] = [];
  const add: DrawnObject[] = [];
  for (const obj of interactableObjects()) {
    const pieces = splitPolylineByTrace(obj.points, trace);
    if (pieces.length > 1) {
      remove.push(obj.id);
      for (const pts of pieces) add.push(cloneWithPoints(obj, pts));
    }
  }
  if (remove.length > 0) p.replaceObjects(remove, add);
}

export function cancelDrawing(): void {
  useToolStore.getState().clearDrawing();
}

/** Cambia de herramienta cerrando primero el gesto pendiente. */
export function setToolSafe(tool: ReturnType<typeof useToolStore.getState>['tool']): void {
  const t = useToolStore.getState();
  if (t.drawing.length > 0) finishDrawing();
  t.setTool(tool);
}

/** Materializa la bisectriz pendiente como polilínea en Interpretación. */
export function materializeBisector(): void {
  const t = useToolStore.getState();
  const b = t.pendingBisector;
  if (!b) return;
  const p1: Point = {
    x: b.origin.x - b.dir.x * b.halfLength,
    y: b.origin.y - b.dir.y * b.halfLength,
  };
  const p2: Point = {
    x: b.origin.x + b.dir.x * b.halfLength,
    y: b.origin.y + b.dir.y * b.halfLength,
  };
  useProjectStore.getState().addHorizon([p1, b.origin, p2], t.currentColor);
  t.setPendingBisector(null);
}

/** Elimina el objeto seleccionado (tecla Supr). */
export function deleteSelection(): void {
  const p = useProjectStore.getState();
  if (p.selection.objectId) p.removeObject(p.selection.objectId);
}

/** Recolorea la selección o fija el color de dibujo. */
export function applyPaletteColor(color: string): void {
  const t = useToolStore.getState();
  const p = useProjectStore.getState();
  t.setCurrentColor(color);
  const sel = p.selection.objectId;
  if (sel && p.horizons.some((h) => h.id === sel)) {
    p.setObjectColor(sel, color);
  }
}

/** Hit-test auxiliar reutilizable (para hover, etc.). */
export function hitTestWorld(world: Point) {
  return hitTestPolylines(
    world,
    interactableObjects().map((o) => ({ id: o.id, points: o.points })),
    toleranceWorld(HIT_TOLERANCE_PX),
  );
}

/** Punto de una polilínea más cercano (usado por corte por punto con snap). */
export function nearestOnObject(objId: string, world: Point) {
  const obj = useProjectStore.getState().getObject(objId);
  if (!obj) return null;
  return closestOnPolyline(world, obj.points);
}
