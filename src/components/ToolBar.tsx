import type { SplitMode, ToolId } from '../types';
import { useToolStore } from '../store/useToolStore';
import { useViewStore } from '../store/useViewStore';
import { setToolSafe } from '../tools/actions';
import { ColorPalette } from './ColorPalette';

const TOOLS: { id: ToolId; icon: string; label: string; title: string }[] = [
  { id: 'select', icon: '⌖', label: 'Seleccionar', title: 'Seleccionar objetos / falla activa' },
  { id: 'horizon', icon: '〰', label: 'Horizonte', title: 'Digitalizar horizonte por vértices' },
  { id: 'faultReverse', icon: '▲', label: 'F. inversa', title: 'Digitalizar falla inversa' },
  { id: 'faultNormal', icon: '⇂', label: 'F. normal', title: 'Digitalizar falla normal' },
  { id: 'ruler', icon: '📏', label: 'Regla', title: 'Medir longitudes y ángulos' },
  { id: 'split', icon: '✂', label: 'Cortar', title: 'Cortar líneas' },
  { id: 'pan', icon: '✋', label: 'Mover', title: 'Panear la vista (o dos dedos / espacio+arrastre)' },
];

const SPLIT_MODES: { id: SplitMode; label: string; title: string }[] = [
  { id: 'point', label: 'Punto', title: 'Cortar tocando un punto de la línea' },
  { id: 'trace', label: 'Trazo', title: 'Cortar todo lo que cruce un trazo digitalizado' },
  { id: 'intersection', label: 'Intersección', title: 'Cortar dos líneas en su intersección' },
];

export function ToolBar() {
  const tool = useToolStore((s) => s.tool);
  const splitMode = useToolStore((s) => s.splitMode);
  const setSplitMode = useToolStore((s) => s.setSplitMode);
  const snapEnabled = useToolStore((s) => s.snapEnabled);
  const toggleSnap = useToolStore((s) => s.toggleSnap);
  const gridVisible = useViewStore((s) => s.gridVisible);
  const toggleGrid = useViewStore((s) => s.toggleGrid);
  const resetView = useViewStore((s) => s.resetView);

  return (
    <nav className="toolbar" aria-label="Herramientas">
      {TOOLS.map((t) => (
        <button
          key={t.id}
          className={`tool-btn ${tool === t.id ? 'active' : ''}`}
          title={t.title}
          aria-pressed={tool === t.id}
          onClick={() => setToolSafe(t.id)}
        >
          <span className="tool-icon">{t.icon}</span>
          <span className="tool-label">{t.label}</span>
        </button>
      ))}

      {tool === 'split' && (
        <div className="split-modes">
          {SPLIT_MODES.map((m) => (
            <button
              key={m.id}
              className={`mode-btn ${splitMode === m.id ? 'active' : ''}`}
              title={m.title}
              onClick={() => setSplitMode(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
      )}

      <div className="toolbar-toggles">
        <button
          className={`tool-btn small ${snapEnabled ? 'active' : ''}`}
          title="Snapping a vértices y segmentos"
          aria-pressed={snapEnabled}
          onClick={toggleSnap}
        >
          <span className="tool-icon">🧲</span>
          <span className="tool-label">Snap</span>
        </button>
        <button
          className={`tool-btn small ${gridVisible ? 'active' : ''}`}
          title="Mostrar/ocultar grilla"
          aria-pressed={gridVisible}
          onClick={toggleGrid}
        >
          <span className="tool-icon">▦</span>
          <span className="tool-label">Grilla</span>
        </button>
        <button
          className="tool-btn small"
          title="Restablecer vista"
          onClick={resetView}
        >
          <span className="tool-icon">🎯</span>
          <span className="tool-label">Vista</span>
        </button>
      </div>

      <ColorPalette />
    </nav>
  );
}
