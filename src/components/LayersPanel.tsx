import type { DrawnObject } from '../types';
import { FAULT_COLOR } from '../constants';
import { useProjectStore } from '../store/useProjectStore';
import { polylineLength } from '../geometry/polyline';
import { formatMeters } from '../canvas/coords';

function ObjectRow({ obj }: { obj: DrawnObject }) {
  const selection = useProjectStore((s) => s.selection);
  const select = useProjectStore((s) => s.select);
  const removeObject = useProjectStore((s) => s.removeObject);
  const isSelected = selection.objectId === obj.id;
  const isActiveFault = obj.kind === 'fault' && selection.activeFaultId === obj.id;

  const label =
    obj.kind === 'horizon'
      ? obj.unitName ?? obj.color
      : `Falla ${obj.faultType === 'reverse' ? 'inversa' : 'normal'}`;

  return (
    <div
      className={`object-row ${isSelected ? 'selected' : ''}`}
      onClick={() => select(obj.id)}
      role="button"
      tabIndex={0}
    >
      <span
        className="obj-swatch"
        style={{ background: obj.kind === 'horizon' ? obj.color : FAULT_COLOR }}
      />
      <span className="obj-label">
        {label}
        {isActiveFault && <em className="active-tag"> activa</em>}
      </span>
      <span className="obj-len">{formatMeters(polylineLength(obj.points))}</span>
      <button
        className="obj-del"
        title="Eliminar"
        aria-label={`Eliminar ${label}`}
        onClick={(e) => {
          e.stopPropagation();
          removeObject(obj.id);
        }}
      >
        ✕
      </button>
    </div>
  );
}

export function LayersPanel() {
  const layers = useProjectStore((s) => s.layers);
  const horizons = useProjectStore((s) => s.horizons);
  const faults = useProjectStore((s) => s.faults);
  const toggleVisible = useProjectStore((s) => s.toggleLayerVisible);
  const toggleLocked = useProjectStore((s) => s.toggleLayerLocked);
  const image = useProjectStore((s) => s.image);

  const objectsIn = (layerId: string): DrawnObject[] =>
    layerId === 'faults'
      ? faults
      : horizons.filter((h) => h.layerId === layerId);

  return (
    <div className="layers-panel">
      {layers.map((l) => {
        const objs = objectsIn(l.id);
        return (
          <section key={l.id} className="layer-block">
            <header className="layer-header">
              <button
                className={`icon-btn ${l.visible ? '' : 'off'}`}
                title={l.visible ? 'Ocultar capa' : 'Mostrar capa'}
                aria-pressed={l.visible}
                onClick={() => toggleVisible(l.id)}
              >
                {l.visible ? '👁' : '🚫'}
              </button>
              <button
                className={`icon-btn ${l.locked ? 'locked' : ''}`}
                title={l.locked ? 'Desbloquear capa' : 'Bloquear capa'}
                aria-pressed={l.locked}
                onClick={() => toggleLocked(l.id)}
              >
                {l.locked ? '🔒' : '🔓'}
              </button>
              <span className="layer-name">{l.name}</span>
              <span className="layer-count">
                {objs.length}
                {l.id === 'reference' && image ? ' + img' : ''}
              </span>
            </header>
            <div className="layer-objects">
              {objs.length === 0 && (
                <div className="empty-note">— sin objetos —</div>
              )}
              {objs.map((o) => (
                <ObjectRow key={o.id} obj={o} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
