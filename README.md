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
  axial traces/sketches with snapping, plus a Well collar tool), Edit (split,
  extend, free transform, duplicate, simplify, smooth, resample/
  densify, join), Dip data, Kink method (fault-bend style construction from
  dip readings), Restoration (Fault Parallel Flow across a fault, and
  flexural-slip unfolding of a folded bed), and Measure & scale (ruler,
  fault throw, two-axis calibration).
- **Canvas** — the section itself; floating Finish/Cancel buttons appear on
  touch devices in place of right-click/Esc.
- **Side panels** (right, collapsible) — Units, Unit polygons (filled bodies
  built between horizons and clipped against faults), Wells (collar +
  lithology column with USGS-style fill patterns), Images & scale,
  Restoration, Properties of the current selection, and a Line-Length table.
- **Footer** — live readouts: cursor position, elevation, scale status,
  measurement, angle, tool hint and last action.

On touch devices (or a mouse+touchscreen hybrid), controls grow to
44px-class tap targets automatically; below ~1250px wide the header
collapses to icon-only buttons so it still fits in one row.

## Data

Projects save as `.sketch.json` (Save / Save as…, Ctrl+S / Ctrl+Shift+S);
`Open` loads one back. Dip data exports to CSV. The section exports as a
vector SVG or a PNG image of the current view, including unit-polygon fills
and well columns.

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
- **Wells** — a collar plus a stack of lithology intervals, filled with the
  same USGS-style pattern library as SectionWorks (sandstone, shale,
  limestone, coal, intrusive, …), rendered both on canvas and in the SVG
  export.
- **Resample / Join** — Resample densifies a line's vertices without
  changing its trace (segments longer than the given spacing are split into
  equal parts); Join chains the selected lines end to end, welding endpoints
  within tolerance and bridging farther ones with a straight segment.

## Deployment

Every push to `main` runs `.github/workflows/deploy.yml`, which checks the
inline script's syntax and publishes `index.html` to GitHub Pages — no
build step involved.
