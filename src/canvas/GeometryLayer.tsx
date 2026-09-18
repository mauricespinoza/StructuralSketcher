import type { Point } from '../types';
import { FAULT_COLOR, UI_TEAL } from '../constants';
import { useProjectStore } from '../store/useProjectStore';
import { useToolStore } from '../store/useToolStore';
import { useViewStore } from '../store/useViewStore';
import { FaultSymbols } from './FaultSymbols';

const ptsAttr = (pts: Point[]) => pts.map((p) => `${p.x},${p.y}`).join(' ');

/** Geometría del proyecto por capas: Referencia → Interpretación → Fallas. */
export function GeometryLayer() {
  const horizons = useProjectStore((s) => s.horizons);
  const faults = useProjectStore((s) => s.faults);
  const layers = useProjectStore((s) => s.layers);
  const selection = useProjectStore((s) => s.selection);
  const splitFirstId = useToolStore((s) => s.splitFirstId);
  const zoom = useViewStore((s) => s.view.zoom);

  const visible = new Map(layers.map((l) => [l.id, l.visible] as const));

  const halo = (id: string) =>
    selection.objectId === id || splitFirstId === id ? (
      <polyline
        points={ptsAttr(
          (horizons.find((h) => h.id === id) ?? faults.find((f) => f.id === id))
            ?.points ?? [],
        )}
        fill="none"
        stroke={UI_TEAL}
        strokeWidth={9}
        strokeOpacity={0.3}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    ) : null;

  return (
    <g id="geometry-layer">
      {(['reference', 'interpretation'] as const).map(
        (layerId) =>
          visible.get(layerId) && (
            <g key={layerId} id={`layer-${layerId}`}>
              {horizons
                .filter((h) => h.layerId === layerId)
                .map((h) => (
                  <g key={h.id}>
                    {halo(h.id)}
                    <polyline
                      points={ptsAttr(h.points)}
                      fill="none"
                      stroke={h.color}
                      strokeWidth={layerId === 'reference' ? 1.8 : 2.4}
                      strokeOpacity={layerId === 'reference' ? 0.75 : 1}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  </g>
                ))}
            </g>
          ),
      )}
      {visible.get('faults') && (
        <g id="layer-faults">
          {faults.map((f) => (
            <g key={f.id}>
              {halo(f.id)}
              {selection.activeFaultId === f.id && (
                <polyline
                  points={ptsAttr(f.points)}
                  fill="none"
                  stroke={UI_TEAL}
                  strokeWidth={6}
                  strokeOpacity={0.25}
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              )}
              <polyline
                points={ptsAttr(f.points)}
                fill="none"
                stroke={FAULT_COLOR}
                strokeWidth={2.6}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
              <FaultSymbols fault={f} zoom={zoom} />
            </g>
          ))}
        </g>
      )}
    </g>
  );
}
