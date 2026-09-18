import type { Project } from '../types';
import { serializeProject, useProjectStore } from '../store/useProjectStore';
import { useViewStore } from '../store/useViewStore';

export function currentProject(): Project {
  return serializeProject(
    useProjectStore.getState(),
    useViewStore.getState().gridVisible,
  );
}

export function validateProject(data: unknown): Project | null {
  if (typeof data !== 'object' || data === null) return null;
  const p = data as Partial<Project>;
  if (p.schemaVersion !== 1) return null;
  if (!Array.isArray(p.horizons) || !Array.isArray(p.faults)) return null;
  return {
    schemaVersion: 1,
    name: typeof p.name === 'string' ? p.name : 'Sección importada',
    layers: Array.isArray(p.layers) ? p.layers : [],
    horizons: p.horizons,
    faults: p.faults,
    image: p.image ?? null,
    gridVisible: p.gridVisible !== false,
    selection: p.selection ?? { objectId: null, activeFaultId: null },
  };
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export function exportProjectJson(): void {
  const p = currentProject();
  const blob = new Blob([JSON.stringify(p, null, 2)], {
    type: 'application/json',
  });
  downloadBlob(blob, `${p.name.replace(/[^\w\-áéíóúñÁÉÍÓÚÑ ]+/g, '') || 'faultdraw'}.json`);
}

export async function importProjectJson(file: File): Promise<boolean> {
  try {
    const text = await file.text();
    const project = validateProject(JSON.parse(text));
    if (!project) return false;
    useProjectStore.getState().loadProject(project);
    useViewStore.getState().setGridVisible(project.gridVisible);
    return true;
  } catch {
    return false;
  }
}
