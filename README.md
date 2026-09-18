# StructuralSketcher

Vector editor for structural geology cross-sections: digitize horizons,
faults, contacts and dip data over an imported image or from scratch, then
measure, split, extend, transform and export the section.

**Live app:** https://mauricespinoza.github.io/StructuralSketcher/

## Running it

Single self-contained `index.html` — no build step, no dependencies, no
network access of any kind. Open it directly from disk (double-click) or
serve it with any static file server:

```bash
python3 -m http.server 8080   # then open http://localhost:8080
```

## Interface

Oriented for both desktop (mouse + keyboard) and tablet (touch + pencil):

- **Header** — new/open/save/save as, image import, section setup, undo/redo,
  SVG/PNG export, and toggles for the tool rail, side panels, fullscreen and
  settings.
- **Second bar** — vertical exaggeration, zoom, zoom-to-extent, and
  visibility toggles for the grid, labels, frame and scale bars.
- **Tool rail** (left, resizable, collapsible) — grouped by task: Navigate
  (pan, select, lasso), Draw (digitize horizons/faults/contacts/topography/
  axial traces/sketches, with snapping), Edit (split, extend, free transform,
  duplicate, simplify, Bézier smoothing), Dip data, Kink method (fault-bend
  style construction from dip readings), and Measure & scale (ruler, fault
  throw, two-axis calibration).
- **Canvas** — the section itself; floating Finish/Cancel buttons appear on
  touch devices in place of right-click/Esc.
- **Side panels** (right, collapsible) — Units, Images & scale, Properties
  of the current selection, and a Line-Length table.
- **Footer** — live readouts: cursor position, elevation, scale status,
  measurement, angle, tool hint and last action.

On touch devices (or a mouse+touchscreen hybrid), controls grow to
44px-class tap targets automatically; below ~1250px wide the header
collapses to icon-only buttons so it still fits in one row.

## Data

Projects save as `.sketch.json` (Save / Save as…, Ctrl+S / Ctrl+Shift+S);
`Open` loads one back. Dip data exports to CSV. The section exports as a
vector SVG or a PNG image of the current view.

## Deployment

Every push to `main` runs `.github/workflows/deploy.yml`, which checks the
inline script's syntax and publishes `index.html` to GitHub Pages — no
build step involved.
