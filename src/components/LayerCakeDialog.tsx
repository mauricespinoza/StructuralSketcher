import { useState } from 'react';
import { STRAT_PALETTE } from '../constants';
import { useProjectStore } from '../store/useProjectStore';
import { useViewStore } from '../store/useViewStore';

/** Genera una pila de horizontes paralelos (layer cake). */
export function LayerCakeDialog({ onClose }: { onClose(): void }) {
  const [count, setCount] = useState(5);
  const [thicknesses, setThicknesses] = useState<number[]>([100, 100, 100, 100, 100]);
  const [width, setWidth] = useState(1000);
  const [target, setTarget] = useState<'interpretation' | 'reference'>('interpretation');
  const addHorizons = useProjectStore((s) => s.addHorizons);

  const setCountAndResize = (n: number) => {
    const c = Math.max(1, Math.min(20, Math.round(n) || 1));
    setCount(c);
    setThicknesses((prev) => {
      const next = prev.slice(0, c);
      while (next.length < c) next.push(prev[prev.length - 1] ?? 100);
      return next;
    });
  };

  const create = () => {
    const { view, size } = useViewStore.getState();
    const cx = view.x + size.w / view.zoom / 2;
    const cy = view.y + size.h / view.zoom / 2;
    const x0 = cx - width / 2;
    const x1 = cx + width / 2;
    const totalH = thicknesses.reduce((s, t) => s + t, 0);
    let y = cy - totalH / 2;
    const items = thicknesses.map((t, i) => {
      const item = {
        points: [
          { x: x0, y },
          { x: x1, y },
        ],
        color: STRAT_PALETTE[i % STRAT_PALETTE.length].color,
      };
      y += t;
      return item;
    });
    addHorizons(items, target);
    onClose();
  };

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <h3>🎂 Generador layer cake</h3>
        <label className="field">
          Cantidad de capas
          <input
            type="number"
            min={1}
            max={20}
            value={count}
            onChange={(e) => setCountAndResize(Number(e.target.value))}
          />
        </label>
        <label className="field">
          Ancho de la pila (m)
          <input
            type="number"
            min={10}
            value={width}
            onChange={(e) => setWidth(Number(e.target.value) || 10)}
          />
        </label>
        <label className="field">
          Capa destino
          <select
            value={target}
            onChange={(e) =>
              setTarget(e.target.value as 'interpretation' | 'reference')
            }
          >
            <option value="interpretation">Interpretación</option>
            <option value="reference">Referencia</option>
          </select>
        </label>
        <div className="thickness-list">
          {thicknesses.map((t, i) => (
            <label key={i} className="field inline">
              <span
                className="obj-swatch"
                style={{ background: STRAT_PALETTE[i % STRAT_PALETTE.length].color }}
              />
              Espesor capa {i + 1} (m)
              <input
                type="number"
                min={1}
                value={t}
                onChange={(e) =>
                  setThicknesses((prev) =>
                    prev.map((v, j) => (j === i ? Number(e.target.value) || 1 : v)),
                  )
                }
              />
            </label>
          ))}
        </div>
        <div className="dialog-actions">
          <button className="btn" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn btn-teal" onClick={create}>
            Crear horizontes
          </button>
        </div>
      </div>
    </div>
  );
}
