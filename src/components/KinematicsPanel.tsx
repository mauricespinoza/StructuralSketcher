import { useState } from 'react';
import { unitNameForColor } from '../constants';
import { useProjectStore } from '../store/useProjectStore';

const MECHANISMS = [
  'Fault-bend fold (Suppe, 1983)',
  'Fault-propagation fold (Suppe & Medwedeff, 1990)',
  'Detachment fold',
  'Trishear (Erslev, 1991)',
  'Simple shear',
];

/**
 * Placeholder de Fase 2: la UI estática existe (falla activa, horizontes
 * activos, mecanismo, slip) pero el motor cinemático aún no está implementado.
 */
export function KinematicsPanel() {
  const faults = useProjectStore((s) => s.faults);
  const horizons = useProjectStore((s) => s.horizons);
  const activeFaultId = useProjectStore((s) => s.selection.activeFaultId);
  const [checkedHorizons, setCheckedHorizons] = useState<Set<string>>(new Set());

  const activeFault = faults.find((f) => f.id === activeFaultId) ?? null;

  const toggleHorizon = (id: string) => {
    setCheckedHorizons((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="kinematics-panel">
      <div className="phase2-banner">
        🚧 <b>Próximamente — Fase 2.</b> El modelado cinemático forward
        (fault-bend fold, fault-propagation, detachment, trishear, simple
        shear) se implementará como aproximación visual/incremental; no
        reemplaza una solución validada tipo FaultFold/MOVE.
      </div>

      <section className="kin-section">
        <h4>1 · Falla activa</h4>
        {activeFault ? (
          <div className="kin-fault">
            ✔ Falla {activeFault.faultType === 'reverse' ? 'inversa' : 'normal'}{' '}
            <code>{activeFault.id.slice(0, 8)}</code>
          </div>
        ) : (
          <div className="empty-note">
            Selecciona una falla con la herramienta Seleccionar.
          </div>
        )}
      </section>

      <section className="kin-section">
        <h4>2 · Horizontes activos</h4>
        {horizons.length === 0 && (
          <div className="empty-note">No hay horizontes digitalizados.</div>
        )}
        {horizons.map((h) => (
          <label key={h.id} className="kin-horizon">
            <input
              type="checkbox"
              checked={checkedHorizons.has(h.id)}
              onChange={() => toggleHorizon(h.id)}
            />
            <span className="obj-swatch" style={{ background: h.color }} />
            {h.unitName ?? unitNameForColor(h.color)}
          </label>
        ))}
      </section>

      <section className="kin-section">
        <h4>3 · Mecanismo</h4>
        <select disabled aria-label="Mecanismo cinemático (Fase 2)">
          {MECHANISMS.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
      </section>

      <section className="kin-section">
        <h4>4 · Slip (−800 a +800 m)</h4>
        <input type="range" min={-800} max={800} defaultValue={0} disabled />
        <div className="hint">
          Slip + : inverso (colgante sube) · Slip − : normal (colgante baja)
        </div>
      </section>

      <button className="btn btn-teal" disabled title="Disponible en Fase 2">
        Aplicar geometría (Fase 2)
      </button>
    </div>
  );
}
