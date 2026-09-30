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
  flexural-slip unfolding); **Forward modeling** (Parallel flow, Bend fold,
  Propagation, Trishear, Simple shear). Each tool's options appear only
  while it is active.
- **Canvas** — the section itself; floating Undo/Redo and Finish/Discard/
  Delete buttons on the top left.
- **Side panels** (right, collapsible) — Properties of the current
  selection, Units, Unit polygons, Images & scale and a Line-Length table.
- **Footer** — live readouts: cursor position, elevation, scale status,
  measurement, angle, tool hint and last action.

Drawing and editing helpers:

- **Shift while drawing** a line constrains the active segment to 0°, 45°,
  90°… (true angles in section space, as the angle readout reports them).
- **Transform** on one or more selected lines shows a box with corner
  handles (Shift keeps the proportions, so nothing is distorted), edge
  handles, a circular-arrows handle on top that rotates everything around
  the pivot — by default the centre of the selection; drag it to move the
  axis — with Shift for 15° steps, and a live angle/scale readout.

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
- **Forward modeling** — deforms the selected lines (or every horizon and
  contact when nothing is selected) over a fault, with a live preview drawn
  over the current section before anything is written. The fault is a
  parametric flat–ramp(–flat) (base, detachment elevation, ramp angle,
  height or initial tip, vergence; "Place" puts the base with a click and
  "From fault" reads it from a drawn fault) or, for Parallel flow and Simple
  shear, any fault line clicked on the section. Methods:
  - *Fault Parallel Flow* (Egan et al., 1997) — hanging wall carried along
    flow lines parallel to the fault, axial surfaces on the bisectors of the
    fault bends.
  - *Fault-bend fold* (Suppe, 1983), mode I — kink-band velocity domains
    bounded by the lower-bend bisector and the upper-bend axial surface of
    Suppe's equation (slip ratio R = sin(γ−θ)/sin γ); once the slip exceeds
    the ramp length the crest widens and the forelimb is carried along.
  - *Fault-propagation fold* (Suppe & Medwedeff, 1990), constant thickness —
    tip advancing at P/S = 2, forelimb syncline pinned to the tip with
    sin(2γ*−θ) = 2 sin θ and forelimb dip 180°−2γ*.
  - *Trishear* (Erslev, 1991; Zehnder & Allmendinger, 2000) with apical
    angle, P/S and concentration factor, plus the backlimb trishear fan of
    Cristallini & Allmendinger (2002) at the fault bend (0° = sharp kink).
  - *Inclined simple shear* (White et al., 1986) — hanging-wall collapse
    over any fault shape with a shear direction inclined from the vertical.

  By default the tool works on the **selected fault** (the ramp is fitted to
  its geometry; Parallel flow and Simple shear move directly over its trace)
  and on the **selected layers**. Interactive handles on the section set
  the ramp base, the ramp top or fault tip (angle and height/initial tip),
  the slip (blue arrow dragged along the fault), splay branch points and
  tips, and the syncline datum; every numeric field also has a slider.
  The slip is split into **n steps**: *Step* writes the next one, *Play*
  animates them in the preview (a scrub slider picks any step) and *Apply*
  writes all that remain. Options per stage:
  - **Syntectonic strata** — after every step a horizontal stratum is
    deposited at datum + k × rise and onlaps the relief, so the growth
    wedge is folded by the following steps.
  - **Splay faults** — one or more splays branching from the main fault at
    a given distance/spacing, dip and length, each taking a share of the
    slip, in sequence after the main fault or synchronously.

  Checkboxes show the **axial surfaces** (active, fixed to the fault, and
  inactive, carried by the hanging wall) and **strain markers** — a grid of
  circles deformed with the rock into strain ellipses, with their long axis
  and the maximum strain ratio. The velocity-field models (bend,
  propagation, trishear) conserve area to a fraction of a percent. Apply
  writes the result in one undo step, cutting lines where the fault offsets
  them, and can also add the fault, the axial surfaces and the markers.
- **Resample / Join** — Resample densifies a line's vertices without
  changing its trace (segments longer than the given spacing are split into
  equal parts); Join chains the selected lines end to end, welding endpoints
  within tolerance and bridging farther ones with a straight segment.

## Deployment

Every push to `main` runs `.github/workflows/deploy.yml`, which checks the
inline script's syntax and publishes `index.html` to GitHub Pages — no
build step involved.
