# StructuralSketcher

Vector editor for structural geology cross-sections: digitize layers,
faults, topography and dip data over an imported image or from scratch, then
measure, split, extend, transform and export the section.

**Live app:** https://mauricespinoza.github.io/StructuralSketcher/

## Running it

Single self-contained `index.html` — no build step, no dependencies, no
network access except two optional features: Google Drive (below), which
loads Google's sign-in and picker scripts only once it is set up, and the DEM topography of the shapefile import (below). Open it directly from disk (double-click) or
serve it with any static file server:

```bash
python3 -m http.server 8080   # then open http://localhost:8080
```

## Interface

Oriented for both desktop (mouse + keyboard) and tablet (touch + pencil):

- **Header** — logo, document name, file (new/open/save/save as), image
  import, data import (shapefile/SEG-Y), section setup, SVG/PNG export, **Versions** (drop-down list of
  saved snapshots), and toggles for the tool rail, side panels, fullscreen
  and settings.
- **Second bar** — vertical exaggeration, zoom, zoom-to-extent, icon
  toggles for grid, labels, frame, scale bars and fills, plus a separate
  *measure & build* button bar: Ruler, Fault throw, Calibrate, Image and
  Create beds (layer cake).
- **Tool rail** (left, resizable, collapsible groups) — Pan/Select/Lasso;
  **Add** Layer, Fault or Topography (with snapping); **Dip & Kink**;
  **Edit** (vertices, drag, transform, split, extend, smooth, simplify,
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

- **Vertices** (X): drag a vertex; double click, Alt+press or the **Add
  vertices** option inserts one on a segment (press and drag in one
  gesture), and a click past an end extends the line; right click deletes.
- **Select all** (Ctrl+A): every visible line and dip (the Select filter
  in the rail restricts it to lines or dips). With several lines selected,
  Properties offers **Type (all)** to make them all Fault, Horizon,
  Contact… at once.
- **Copy / cut / paste** (Ctrl+C / Ctrl+X / Ctrl+V, ⌘ on Mac, or the
  context menu) of the selected lines and dips, through the system
  clipboard, so they can go to another tab or project. A paste lands in
  the same section coordinates; pasting again in the same document offsets
  the copies so they don't hide the original. One undo per paste.
- **Drag** (J), as in GISDraw: pull one vertex and its neighbours follow
  less and less along the line (½·(1 + cos πt)); at 100 % reach the
  gradient ends at the line's ends, which stay fixed — less is more local
  ([ and ] keys). Coincident vertices of other lines (a layer ending on a
  fault) move with it (**Move joined**), and the vertex snaps to other
  lines' vertices. One undo per drag.

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
`Open` loads one back. Dip data exports to CSV.

### Google account and Drive

As in GISDraw, the **Google** button in the header (next to Save as) signs
in with a Google account and opens, imports and saves projects in Google
Drive through the Drive API:

- **Save to Drive…** — the first time, pick a folder (My Drive or a shared
  drive) in the Google picker and a file name; from then on **Save**
  (Ctrl+S) updates that Drive file. **Save in another folder…** makes a new
  copy elsewhere. The file is the same self-contained `.sketch.json`.
- **Open / import from Drive…** — a project (`.json`) opens and stays
  linked to its Drive file; an image is imported to trace over; a
  shapefile (`.shp` + `.dbf`/`.prj`…, several files at once) or a SEG-Y
  goes through the usual data import.

Setup (once): the app ships no keys of its own. In
[Google Cloud Console](https://console.cloud.google.com) create a project,
enable **Google Drive API** and **Google Picker API**, and create an
**OAuth client ID** of type *Web application* whose authorized JavaScript
origin is the app's origin (e.g. `https://mauricespinoza.github.io`). Paste
it in *Google account → Setup*. An optional **API key** lets you open files
shared with "anyone with the link" without signing in. The app requests
the `drive.file` scope: it only sees the files it creates or that you pick.
Sign-in needs the app served over http(s) — it does not work from a
`file://` copy opened by double click. The access token lives in memory
(Google renews it hourly); only the setup, the last folder and the account
name are remembered in the browser. The section exports as a
vector SVG or a PNG image of the current view, including unit-polygon fills.

### Importing georeferenced data

**Import data** (header) or the **Imported data** panel — or drop the files
on the canvas:

- **Shapefiles**, 2D or 3D (PointZ, MultiPointZ, PolyLineZ, PolygonZ and
  their M variants): select the `.shp` with its `.dbf` and `.prj` — several
  layers at once — and optionally an ArcGIS `.lyr` for the symbology. Every
  feature is projected square onto a **section trace** set on a map preview
  (fitted automatically to the polylines/polygons of an exported section,
  or drawn with Shift+drag, its ends dragged or typed): distance along the
  trace becomes the section's horizontal axis and Z (or a numeric attribute
  such as depth) its elevation. A max-distance swath filters scattered
  data (e.g. a seismic catalogue); with a Mercator or geographic `.prj`
  distances are corrected for the scale factor so they are true metres, in
  the same scale as Z. Polylines become editable lines (horizon, fault,
  topography… by name or by choice); points and polygons become reference
  layers drawn under the lines, with size, opacity and per-class colours in
  the Imported data panel. Points with `dip` and `azimuth` (dip direction)
  fields can also become dip symbols with the apparent dip in the section.
  The trace is stored with the section, so later imports share its
  distances. When the polylines/polygons bend in plan view (a kinked
  section, as MOVE builds them) the trace follows them and distance is
  the chainage along it, so data around the kinks is not shifted; points
  can also be projected along a given azimuth instead of square. Each
  layer is reprojected from its own `.prj` (geographic, Mercator,
  UTM/Transverse Mercator; no datum shift) and has its own Z units and
  depth sign (guessed against the section), and the dialog shows each
  layer's median distance to the trace and Z range to catch mismatches.
- **Symbology**: unique-value classes of a `.lyr` (e.g. MOVE's
  `MoveSymbologyForESRI.lyr` on the `Type` field) are read from the file's
  serialized ArcObjects (colours, marker sizes); without one, MOVE's
  `colorval` attribute colours each feature.
- **SEG-Y** (`.sgy`/`.segy`, rev 0/1/2, big- or little-endian, IBM/IEEE
  float, int32/int16/int8 samples) becomes an image of the section with the
  StructuralWorks palettes, clip and gain. Trace spacing comes from the
  trace-header coordinates; if the section has a trace, the line can be
  placed on it by those coordinates. The vertical axis is two-way time,
  depth converted with a constant velocity, or depth.

## Structural algorithms

Ported from the [SectionWorks](https://example.com/repo) QGIS plugin (the
project this app descends from) and adapted to StructuralSketcher's own
plain (distance, elevation) section space — no world coordinates or map
trace involved:

- **Unit polygons** — the visible horizons, faults, topography and the
  **model boundary** form a planar arrangement (every crossing is a node);
  each closed area is one body, filled with the unit of the horizon that
  bounds it from above. The basal unit therefore reaches the bottom of the
  boundary, layers that stop short of the sides reach them, a unit cut by a
  fault becomes one polygon per fault block, and curved layers that cross
  or partly overlap are resolved without assuming which one is "below".
  Loose layer ends are carried (for the fill only) along their own
  direction to the first line they meet (optionally up to a maximum gap);
  closed lenses become holes. The boundary is automatic (the horizons'
  extent with a floor below the lowest one) until edited with **Edit
  boundary** in the Unit polygons panel: drag corners or sides (sides move
  square to themselves), double click a side to add a corner, right click
  or Del to remove one, Shift+drag to draw a new rectangle; the fills are
  rebuilt on every change. Rebuild from the panel after editing the
  horizons.
- **Tidy** (Edit rail, Properties, context menu) — each end of the
  selected lines is extended along its own direction until it meets the
  next visible line (horizon, fault, topography…); an end that already
  crossed a line by a short overshoot (~24 px) is trimmed at the crossing,
  and an end that already touches one is left alone. Duplicate vertices
  are removed. **Tidy max distance** caps how far an end may grow (empty =
  up to the first line it meets). One undo step.
- **Layer–fault topology** — forward-modeling cuts end exactly on the
  fault (each piece is carried along its own direction to the trace), and
  every layer end close to the active fault, a backthrust, a splay or a
  passive fault is seated on it after each step. **To faults** (Edit rail,
  Properties, context menu) does the same on drawn lines: an end within the
  Tidy max distance of a visible fault is trimmed where it crossed or
  extended until it touches.
- **Fault Parallel Flow restoration** — moves the hanging-wall side of a
  fault by a given slip, carrying points along flow lines parallel to the
  fault (an unclamped offset of the fault trace), the standard 2D
  restoration technique for removing displacement across a fault. Lines
  that end on the fault (horizon cutoffs, a backthrust or splay rooted on
  it) slide along it with their block and stay on it instead of being left
  behind. **Join cutoffs** then welds each layer back across the restored
  fault (pieces of the same unit, or of the same base name — "Top K" and
  "Top K (2)" — whose cutoffs meet within the tolerance); larger gaps are
  not bridged but reported as the restoration's misfit, so the slip can be
  corrected.
- **Flexural-slip unfolding** — flattens a folded "template" bed onto a
  horizontal datum through a pin point of zero slip, carrying every other
  selected line with it at the same perpendicular distance from the
  template (constant bed length). The unfold amount can be partial (0–100%).
- **Forward modeling** — deforms the selected lines (or every horizon and
  contact when nothing is selected) over a fault, with a live preview drawn
  over the current section before anything is written. There is no
  vergence setting: the fault geometry (its dip) defines the hanging wall —
  always the block above the fault — and the sign of the slip says where it
  goes: positive up (reverse), negative down (normal; Suppe's kink-band
  models only take reverse slip). The fault is a
  parametric flat–ramp(–flat) (base, detachment elevation, dip and dip
  direction, height or initial tip; "Place" puts the base with a click and
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
    sin(2γ*−θ) = 2 sin θ and forelimb dip 180°−2γ*. By default it runs on
    the drawn fault (the only drawn fault, the selected one or the one you
    click); the parametric ramp is the alternative. It only exists for
    dips up to 30°: steeper faults, or a drawn fault that turns vertical or
    overturned where the tip passes, give an error message with the angle.
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
  - **Backthrust (structural wedge)** — Parallel flow only. A structural
    wedge / triangle zone with a passive roof (Banks & Warburton, 1986;
    Medwedeff, 1992; Shaw et al., 2005). The backthrust is rooted at the
    wedge tip on the main fault and rises toward the hinterland; it is
    either drawn (any shape, listric included — mark it in Properties as
    *Forward role → Active backthrust*) or straight from a root distance
    and a dip β. Blocks: footwall (fixed); the **wedge** below the
    backthrust; the **roof** above it; the **block ahead** of the tip.
    **Slip past the tip (a)** is the share of the main-fault slip S that
    goes on along the main fault beyond the tip (the block ahead slides
    a·S on it); the rest, (1 − a)·S, is taken by the wedge under a roof
    that does not move horizontally relative to the block ahead (passive
    roof). The velocity field is therefore
    `v = a·v(fault-parallel flow) + (1 − a)·v(passive-roof wedge)`, and
    across every boundary the normal velocity is continuous (area is
    conserved) while the tangential jump is the slip:
    - backthrust slip **k = (1 − a)·cos θ / cos β** per unit of S
      (θ = main fault dip at the tip, β = backthrust dip at its root);
    - roof uplift over the wedge (1 − a)·(sin θ + cos θ·tan β), taken up by
      a frontal axial surface through the tip — vertical for a straight
      backthrust, bent on the bisectors of a listric one — which forms the
      roof's forelimb.
    a = 0: the main fault ends at the tip; a = 100 %: no backthrust slip
    (plain Parallel flow). The tip and the backthrust are material lines of
    the wedge: the tip advances S along the main fault and the backthrust
    never cuts it; the roof flows parallel to the backthrust (Egan et al.,
    1997), so a drawn backthrust keeps its whole shape. Both faults cut and
    offset the layers. **Negative slip restores** (the same field run
    backward) and **Join cutoffs** welds the layers back across the main
    fault and the backthrust. Each stage updates the drawn main fault (its
    new tip; what is drawn beyond it is kept) and the backthrust line, and
    moves the root for the next stage.
    Why the backthrust is rooted at the tip: a material backthrust rooted
    on a main fault that keeps the same slip on both sides of the root
    cannot slip (the relative velocity of the blocks on either side would
    be parallel to the main fault); rooted at a bend it is stationary and
    the rock flows through it, i.e. it is an axial surface, not a fault
    (the same velocity-boundary condition as Suppe's slip ratio). The wedge
    tip is the configuration in which both faults slip and offset layers.
  - **Fault roles** — in Properties, *Forward role*: **Active backthrust**
    (above) or **Passive (carried)**: a passive fault is always carried
    with the layers, without slip of its own, its root sliding along the
    main fault. The canvas labels the **Active fault**, the
    **Backthrust** (in its own colour) and **Passive** faults.

  Checkboxes show the **axial surfaces** (active, fixed to the fault, and
  inactive, carried by the hanging wall) and **strain markers** — a grid of
  circles deformed with the rock into strain ellipses, with their long axis
  and the maximum strain ratio. The velocity-field models (bend,
  propagation, trishear) conserve area to a fraction of a percent. Apply
  writes the result in one undo step, cutting lines where the fault offsets
  them, and can also add the fault, the axial surfaces and the markers.
  Lines that end on the main fault (cutoffs, or a backthrust or splay drawn
  rooted on it) travel with their block and stay on the fault instead of
  being cut against it.
- **Resample / Join** — Resample densifies a line's vertices without
  changing its trace (segments longer than the given spacing are split into
  equal parts); Join chains the selected lines end to end, welding endpoints
  within tolerance and bridging farther ones with a straight segment.

## Deployment

Every push to `main` runs `.github/workflows/deploy.yml`, which checks the
inline script's syntax and publishes `index.html` to GitHub Pages — no
build step involved.

## Info / version log

Settings → **About** shows the logo, author, contact, disclaimer and the
**last two versions** only. On each release bump `SW.APP.version` and prepend
an entry to `SW.APP.changelog` in `index.html`; older entries can stay in the
array, the view only lists the first two.

## Tablet gestures

- Hold 1 s on empty space with finger or pencil, then drag: lasso selection
  (the context menu opens on release if you do not drag).
- Lifting the pencil/finger, or tapping outside, always closes the current
  move/transform/vertex edit.
- With a pencil connected, a finger tap anywhere finishes the current shape
  (like Done). With finger only, use the green tick (Done).
- Hold one finger on the screen and tap items with another finger to
  multi-select (like Ctrl+click); a lasso also works.
- When a tool finishes a shape it hands control back to Select.
- Extend, Transform, etc. act on the whole selection.

## Propagation fold on the drawn fault

With the Propagation tool the hanging wall flows parallel to each segment of
the drawn trace (axial surfaces on the bisectors of the bends) and the
Suppe & Medwedeff fold grows ahead of the tip with the dip of the segment the
tip is on. The tip starts at the drawn end (editable: *Initial tip*, or drag
its handle) and advances 2 × slip along the trace, straight beyond its end.
If the drawn fault dips more than 30° anywhere the tip travels, the model
reports the angle and where it occurs instead of drawing a wrong fold.

## Trishear on the selected fault

Select a fault and pick Trishear: the hanging wall moves over the exact
drawn trace. Only P/S, trishear angle, symmetry (hanging-wall share), initial
tip, backlimb angle and backlimb bend position are adjusted.
Outside the trishear triangle the hanging wall moves either by
fault-parallel flow (axial surfaces on the bisectors of the fault bends;
where two bisectors meet they merge into one) or by inclined simple shear
(axial surfaces along the shear direction).

Splay faults are exact copies of the main fault repeated at a given
horizontal spacing on the same detachment; in sequence each new fault
carries the earlier ones.

**Follow line** (fault lines, Properties panel or context menu): where the
fault crosses — or, extended, reaches — another line, it continues along
that line up to its end.

## Topography from a free DEM (shapefile import)

In the shapefile import dialog, **Add topography (DEM)** samples the ground
surface along the section trace and adds it as an editable *Topography*
line (distances share the trace's scale, elevations in metres). Sources, as
in FieldDraw:

- **Terrarium** (Mapzen / AWS Open Data, ~30 m, no key) — the default.
- **Copernicus GLO-30** or **SRTM GL1** through OpenTopography — needs a
  free API key (portal.opentopography.org/myopentopo), kept only in the
  browser.

The trace needs a known coordinate system (a `.prj`, or coordinates that
are plain lon/lat). Only this option goes online.
