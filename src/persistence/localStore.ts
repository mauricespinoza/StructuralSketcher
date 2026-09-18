import { AUTOSAVE_DEBOUNCE_MS, AUTOSAVE_KEY } from '../constants';
import { useProjectStore } from '../store/useProjectStore';
import { useViewStore } from '../store/useViewStore';
import { currentProject, validateProject } from './projectJson';

let timer: ReturnType<typeof setTimeout> | null = null;

function save(): void {
  try {
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(currentProject()));
  } catch {
    // cuota llena (imagen muy grande): se ignora silenciosamente
  }
}

/** Restaura el último proyecto y activa el autosave con debounce. */
export function initAutosave(): void {
  try {
    const raw = localStorage.getItem(AUTOSAVE_KEY);
    if (raw) {
      const project = validateProject(JSON.parse(raw));
      if (project) {
        useProjectStore.getState().loadProject(project);
        useViewStore.getState().setGridVisible(project.gridVisible);
      }
    }
  } catch {
    // datos corruptos: se parte de cero
  }

  const schedule = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(save, AUTOSAVE_DEBOUNCE_MS);
  };

  useProjectStore.subscribe((s, prev) => {
    if (
      s.horizons !== prev.horizons ||
      s.faults !== prev.faults ||
      s.image !== prev.image ||
      s.layers !== prev.layers ||
      s.name !== prev.name
    ) {
      schedule();
    }
  });
  useViewStore.subscribe((s, prev) => {
    if (s.gridVisible !== prev.gridVisible) schedule();
  });
}

export function clearAutosave(): void {
  localStorage.removeItem(AUTOSAVE_KEY);
}
