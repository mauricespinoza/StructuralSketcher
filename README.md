# StructuralSketcher — Balance & Kinematics

Editor vectorial técnico para geología estructural: digitalización de secciones
geológicas, capas bloqueables, medición, corte de líneas contra fallas y
balance por unidad geológica (estilo *Section Analysis* de MOVE). Responsive
para PC, iPad y iPhone (mouse, teclado y touch con pinch-zoom).

**App en línea:** https://mauricespinoza.github.io/StructuralSketcher/

## Uso local

```bash
npm install
npm run dev        # http://localhost:5173
npm run test       # tests de geometría y balance (Vitest)
npm run typecheck  # tsc --noEmit
npm run build      # build de producción (dist/)
```

## Estado — Fase 1 (MVP)

- ✅ Lienzo SVG con grilla adaptativa 1-2-5, barra de escala y zoom
  (rueda / pinch dos dedos) + paneo (dos dedos, botón central,
  espacio+arrastre o herramienta Mover).
- ✅ Capas Referencia / Interpretación / Fallas con visibilidad y bloqueo.
- ✅ Herramientas: Selección (recolorear, falla activa), Horizonte,
  Falla inversa (dientes) / normal (tics), Regla (Σ longitud, ángulo en vivo,
  bisectriz auxiliar materializable), Corte (por punto / trazo / intersección).
- ✅ Snapping vértice > segmento con indicador e interruptor.
- ✅ Generador layer-cake e importación de imagen de fondo con opacidad.
- ✅ Análisis: balance por unidad (longitudes, espesor medio, cortes
  horizonte–falla deduplicados por ubicación).
- ✅ Persistencia: autosave en localStorage, export/import JSON,
  export SVG y PNG.
- 🚧 **Fase 2 (pendiente)**: modelado cinemático forward — fault-bend fold
  (Suppe 1983), fault-propagation fold (Suppe & Medwedeff 1990), detachment,
  trishear (Erslev 1991, con P/S y ángulo) y simple shear; clasificación de
  hangingwall por buzamiento; slip −800…+800 m; flechas de movimiento
  opuesto. El panel Cinemática ya expone la UI como placeholder.

## Atajos

| Acción | PC | Touch |
|---|---|---|
| Añadir vértice | clic | tap |
| Cerrar polilínea | Enter · doble clic · clic derecho · clic fuera | doble tap · tap fuera |
| Cancelar | Esc | — |
| Zoom | rueda | pinch |
| Paneo | botón central · espacio+arrastre · herramienta Mover | dos dedos |
| Borrar selección | Supr | botón ✕ en panel Capas |
| Deshacer / rehacer | Ctrl+Z / Ctrl+Y | botones ↶ ↷ |

## Arquitectura

- Vite + React 18 + TypeScript + Zustand.
- `src/geometry/` — funciones puras testeadas (longitud, ángulo, bisectriz,
  intersección, punto más cercano, splits, snap).
- `src/analysis/balance.ts` — balance por unidad geológica.
- `src/canvas/` — lienzo SVG (viewBox = vista; coordenadas de mundo en metros;
  trazos con `vector-effect: non-scaling-stroke`).
- `src/tools/actions.ts` — dispatcher de herramientas sobre los stores.
- `src/persistence/` — autosave, JSON, exportadores SVG/PNG.

## Despliegue

Cada push a `main` dispara `.github/workflows/deploy.yml`: corre typecheck +
tests, construye con Vite (`base: /StructuralSketcher/`) y publica `dist/`
en GitHub Pages.
