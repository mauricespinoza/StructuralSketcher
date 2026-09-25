# StructuralSketcher

Vector editor for structural geology cross-sections: digitize layers,
faults, topography and dip data over an imported image or from scratch, then
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

- **Header** — logo, document name, file (new/open/save/save as), image
  import, section setup, SVG/PNG export, **Versions** (drop-down list of
  saved snapshots), and toggles for the tool rail, side panels, fullscreen
  and settings.
- **Second bar** — vertical exaggeration, zoom, zoom-to-extent, icon
  toggles for grid, labels, frame, scale bars and fills, plus a separate
  *measure & build* button bar: Ruler, Fault throw, Calibrate, Image and
  Create beds (layer cake).
- **Tool rail** (left, resizable, collapsible groups) — Pan/Select/Lasso;
  **Add** Layer, Fault or Topography (with snapping); **Dip & Kink**;
  **Edit** (vertices, transform, split, extend, smooth, simplify,
  resample, join, duplicate); **Restore** (Fault Parallel Flow and
  flexural-slip unfolding). Each tool's options appear only while it is
  active.
- **Canvas** — the section itself; floating Undo/Redo and Finish/Discard/
  Delete buttons on the top left.
- **Side panels** (right, collapsible) — Properties of the current
  selection, Units, Unit polygons, Images & scale and a Line-Length table.
- **Footer** — live readouts: cursor position, elevation, scale status,
  measurement, angle, tool hint and last action.

On touch devices (or a mouse+touchscreen hybrid), controls grow to
44px-class tap targets automatically; below ~1250px wide the header
collapses to icon-only buttons so it still fits in one row.

## Data

Projects save as `.sketch.json` (Save / Save as…, Ctrl+S / Ctrl+Shift+S);
`Open` loads one back. Dip data exports to CSV. The section exports as a
vector SVG or a PNG image of the current view, including unit-polygon fills.

## Structural algorithms

Ported from the [SectionWorks](https://example.com/repo) QGIS plugin (the
project this app descends from) and adapted to StructuralSketcher's own
plain (distance, elevation) section space — no world coordinates or map
trace involved:

- **Unit polygons** — each horizon is the top of a unit and the next one
  down is its base; the fill is clipped against every visible fault, so a
  unit cut by a fault becomes one polygon per fault block. Rebuild from the
  Unit polygons panel after editing the horizons.
- **Fault Parallel Flow restoration** — moves the hanging-wall side of a
  fault by a given slip, carrying points along flow lines parallel to the
  fault (an unclamped offset of the fault trace), the standard 2D
  restoration technique for removing displacement across a fault.
- **Flexural-slip unfolding** — flattens a folded "template" bed onto a
  horizontal datum through a pin point of zero slip, carrying every other
  selected line with it at the same perpendicular distance from the
  template (constant bed length). The unfold amount can be partial (0–100%).
- **Resample / Join** — Resample densifies a line's vertices without
  changing its trace (segments longer than the given spacing are split into
  equal parts); Join chains the selected lines end to end, welding endpoints
  within tolerance and bridging farther ones with a straight segment.

## Deployment

Every push to `main` runs `.github/workflows/deploy.yml`, which checks the
inline script's syntax and publishes `index.html` to GitHub Pages — no
build step involved.
