import { useRef } from 'react';
import { STRAT_PALETTE } from '../constants';
import { useToolStore } from '../store/useToolStore';
import { applyPaletteColor } from '../tools/actions';

/**
 * Paleta estratigráfica + selector de color completo.
 * Con un horizonte seleccionado, recolorea; si no, fija el color de dibujo.
 */
export function ColorPalette() {
  const currentColor = useToolStore((s) => s.currentColor);
  const pickerRef = useRef<HTMLInputElement>(null);

  return (
    <div className="palette" data-keep-drawing="true">
      {STRAT_PALETTE.map((p) => (
        <button
          key={p.color}
          className={`swatch ${currentColor.toLowerCase() === p.color.toLowerCase() ? 'active' : ''}`}
          style={{ background: p.color }}
          title={p.name}
          aria-label={`Color ${p.name}`}
          onClick={() => applyPaletteColor(p.color)}
        />
      ))}
      <button
        className="swatch rainbow"
        title="Paleta completa"
        aria-label="Paleta de colores completa"
        onClick={() => pickerRef.current?.click()}
      />
      <input
        ref={pickerRef}
        type="color"
        value={currentColor}
        style={{ position: 'absolute', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}
        onChange={(e) => applyPaletteColor(e.target.value)}
      />
    </div>
  );
}
