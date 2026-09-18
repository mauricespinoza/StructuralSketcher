import { useRef } from 'react';
import { useProjectStore } from '../store/useProjectStore';
import { exportProjectJson, importProjectJson } from '../persistence/projectJson';
import { exportPng, exportSvg } from '../persistence/exporters';
import { clearAutosave } from '../persistence/localStore';

interface Props {
  onOpenLayerCake(): void;
  onOpenImage(): void;
  onTogglePanel(): void;
}

export function TopBar({ onOpenLayerCake, onOpenImage, onTogglePanel }: Props) {
  const name = useProjectStore((s) => s.name);
  const setName = useProjectStore((s) => s.setName);
  const undo = useProjectStore((s) => s.undo);
  const redo = useProjectStore((s) => s.redo);
  const canUndo = useProjectStore((s) => s.past.length > 0);
  const canRedo = useProjectStore((s) => s.future.length > 0);
  const resetProject = useProjectStore((s) => s.resetProject);
  const fileRef = useRef<HTMLInputElement>(null);

  const onNew = () => {
    if (window.confirm('¿Crear un proyecto nuevo? Se borrará la sección actual.')) {
      resetProject();
      clearAutosave();
    }
  };

  const onImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    const ok = await importProjectJson(f);
    if (!ok) window.alert('El archivo no es un proyecto StructuralSketcher válido.');
  };

  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-name">StructuralSketcher</span>
        <span className="brand-sub">Balance & Kinematics</span>
      </div>
      <input
        className="project-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        aria-label="Nombre del proyecto"
      />
      <div className="topbar-actions">
        <button className="btn" onClick={onNew} title="Nuevo proyecto">
          🗋 Nuevo
        </button>
        <button
          className="btn"
          onClick={undo}
          disabled={!canUndo}
          title="Deshacer (Ctrl+Z)"
        >
          ↶
        </button>
        <button
          className="btn"
          onClick={redo}
          disabled={!canRedo}
          title="Rehacer (Ctrl+Y)"
        >
          ↷
        </button>
        <span className="sep" />
        <button className="btn" onClick={onOpenLayerCake} title="Generar pila de capas paralelas">
          🎂 Layer cake
        </button>
        <button className="btn" onClick={onOpenImage} title="Imagen de fondo">
          🖼 Imagen
        </button>
        <span className="sep" />
        <button className="btn" onClick={() => fileRef.current?.click()} title="Importar proyecto JSON">
          📂 Abrir
        </button>
        <button className="btn" onClick={exportProjectJson} title="Exportar proyecto JSON">
          💾 JSON
        </button>
        <button className="btn" onClick={() => exportSvg(true)} title="Exportar SVG">
          SVG
        </button>
        <button className="btn" onClick={() => exportPng(true)} title="Exportar PNG">
          PNG
        </button>
        <button className="btn panel-toggle" onClick={onTogglePanel} title="Mostrar/ocultar panel">
          ☰ Panel
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        style={{ display: 'none' }}
        onChange={onImport}
      />
    </header>
  );
}
