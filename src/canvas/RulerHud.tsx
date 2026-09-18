import { useToolStore } from '../store/useToolStore';
import { angleBetween, interiorAngle, polylineLength } from '../geometry/polyline';
import { dist } from '../geometry/point';
import { formatMeters } from './coords';
import { cancelDrawing, finishDrawing, materializeBisector } from '../tools/actions';

/** Panel flotante de la regla: longitudes, ángulo y control de bisectriz. */
export function RulerHud() {
  const tool = useToolStore((s) => s.tool);
  const drawing = useToolStore((s) => s.drawing);
  const cursor = useToolStore((s) => s.cursorWorld);
  const snapHit = useToolStore((s) => s.snapHit);
  const bisectorOn = useToolStore((s) => s.bisectorOn);
  const setBisectorOn = useToolStore((s) => s.setBisectorOn);
  const pendingBisector = useToolStore((s) => s.pendingBisector);

  if (tool !== 'ruler') return null;

  const live = snapHit?.point ?? cursor;
  const fixedLen = polylineLength(drawing);
  const last = drawing[drawing.length - 1];
  const liveLen = last && live ? dist(last, live) : 0;
  const liveAngle = last && live ? angleBetween(last, live) : null;
  const kinkAngle =
    drawing.length >= 2 && live
      ? interiorAngle(drawing[drawing.length - 2], last, live)
      : null;

  return (
    <div className="ruler-hud" data-keep-drawing="true">
      <div className="hud-title">Regla</div>
      <div className="hud-row">
        <span>Σ fijada</span>
        <b>{formatMeters(fixedLen)}</b>
      </div>
      <div className="hud-row">
        <span>Σ + cursor</span>
        <b>{formatMeters(fixedLen + liveLen)}</b>
      </div>
      <div className="hud-row">
        <span>Tramo</span>
        <b>{formatMeters(liveLen)}</b>
      </div>
      <div className="hud-row">
        <span>Ángulo</span>
        <b>{liveAngle === null ? '—' : `${liveAngle.toFixed(1)}°`}</b>
      </div>
      {kinkAngle !== null && (
        <div className="hud-row">
          <span>Áng. interno</span>
          <b>{kinkAngle.toFixed(1)}°</b>
        </div>
      )}
      <label className="hud-toggle">
        <input
          type="checkbox"
          checked={bisectorOn}
          onChange={(e) => setBisectorOn(e.target.checked)}
        />
        Bisectriz auxiliar
      </label>
      {pendingBisector && (
        <button
          className="btn btn-teal"
          onPointerDown={(e) => e.preventDefault()}
          onClick={materializeBisector}
        >
          ➕ Agregar bisectriz
        </button>
      )}
      <div className="hud-actions">
        <button className="btn" onClick={finishDrawing}>
          Cerrar
        </button>
        <button className="btn" onClick={cancelDrawing}>
          Limpiar
        </button>
      </div>
    </div>
  );
}
