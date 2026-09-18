import { useState } from 'react';
import type { BalanceResult, UnitBalance } from '../analysis/balance';
import { computeBalance } from '../analysis/balance';
import { useProjectStore } from '../store/useProjectStore';
import { formatMeters } from '../canvas/coords';

const BAR_W = 220;

function UnitRow({ unit, maxLength }: { unit: UnitBalance; maxLength: number }) {
  const barLen = maxLength > 0 ? (unit.totalLength / maxLength) * BAR_W : 0;
  const [xMin, xMax] = unit.xRange;
  const span = xMax - xMin;

  return (
    <div className="unit-row">
      <div className="unit-head">
        <span className="obj-swatch" style={{ background: unit.color }} />
        <b>{unit.unitName}</b>
        <span className="unit-count">
          {unit.count} línea{unit.count !== 1 ? 's' : ''}
        </span>
      </div>
      <svg
        className="unit-bar"
        width={BAR_W + 12}
        height={26}
        role="img"
        aria-label={`Longitud ${formatMeters(unit.totalLength)}`}
      >
        <line
          x1={6}
          y1={13}
          x2={6 + barLen}
          y2={13}
          stroke={unit.color}
          strokeWidth={5}
          strokeLinecap="round"
        />
        {span > 0 &&
          unit.cuts.map((c, i) => {
            const fx = 6 + ((c.point.x - xMin) / span) * barLen;
            return (
              <line
                key={i}
                x1={fx}
                y1={4}
                x2={fx}
                y2={22}
                stroke="#C43B3B"
                strokeWidth={2}
              />
            );
          })}
      </svg>
      <div className="unit-stats">
        <span>
          Σ <b>{formatMeters(unit.totalLength)}</b>
        </span>
        <span>
          Espesor{' '}
          <b>
            {unit.meanThicknessToNext === null
              ? '—'
              : formatMeters(unit.meanThicknessToNext)}
          </b>
        </span>
        <span>
          Cortes <b>{unit.cuts.length}</b>
        </span>
      </div>
    </div>
  );
}

/** Columna de análisis estilo "Section Analysis" de MOVE. */
export function AnalysisPanel() {
  const horizons = useProjectStore((s) => s.horizons);
  const faults = useProjectStore((s) => s.faults);
  const [result, setResult] = useState<BalanceResult | null>(null);

  const run = () => setResult(computeBalance(horizons, faults));
  const maxLength = result
    ? Math.max(...result.units.map((u) => u.totalLength), 1)
    : 1;

  return (
    <div className="analysis-panel">
      <button className="btn btn-teal" onClick={run}>
        📐 Balance por unidad geológica
      </button>

      {result === null && (
        <div className="empty-note" style={{ marginTop: 12 }}>
          Digitaliza horizontes y presiona el botón para calcular longitudes,
          espesores medios y cortes de falla por unidad.
        </div>
      )}

      {result !== null && result.units.length === 0 && (
        <div className="empty-note" style={{ marginTop: 12 }}>
          No hay horizontes con ≥2 vértices para analizar.
        </div>
      )}

      {result !== null && result.units.length > 0 && (
        <>
          <div className="analysis-note">
            Unidades ordenadas de somera a profunda. Marcas rojas = cortes
            horizonte–falla proyectados en x.
          </div>
          {result.units.map((u) => (
            <UnitRow key={u.color} unit={u} maxLength={maxLength} />
          ))}
          <div className="analysis-summary">
            <b>{result.intersections.length}</b>{' '}
            {result.intersections.length === 1
              ? 'intersección'
              : 'intersecciones'}{' '}
            horizonte–falla en total.
          </div>
        </>
      )}
    </div>
  );
}
