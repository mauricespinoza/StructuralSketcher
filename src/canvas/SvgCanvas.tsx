import { useRef } from 'react';
import { useViewStore } from '../store/useViewStore';
import { useToolStore } from '../store/useToolStore';
import { useCanvasInteraction } from './useCanvasInteraction';
import { formatMeters, niceStep } from './coords';
import { GridLayer } from './GridLayer';
import { GeometryLayer } from './GeometryLayer';
import { ImageLayer } from './ImageLayer';
import { OverlayLayer } from './OverlayLayer';
import { RulerHud } from './RulerHud';

function ScaleBar() {
  const view = useViewStore((s) => s.view);
  const step = niceStep(120 / view.zoom);
  const px = step * view.zoom;
  return (
    <div className="scale-bar">
      <div className="scale-line" style={{ width: `${px}px` }} />
      <span>{formatMeters(step)}</span>
    </div>
  );
}

function CursorReadout() {
  const cursor = useToolStore((s) => s.cursorWorld);
  if (!cursor) return null;
  return (
    <div className="cursor-readout">
      x: {cursor.x.toFixed(1)} m · y: {cursor.y.toFixed(1)} m
    </div>
  );
}

export function SvgCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  useCanvasInteraction(svgRef, containerRef);

  const view = useViewStore((s) => s.view);
  const size = useViewStore((s) => s.size);
  const gridVisible = useViewStore((s) => s.gridVisible);
  const tool = useToolStore((s) => s.tool);

  const viewBox = `${view.x} ${view.y} ${size.w / view.zoom} ${size.h / view.zoom}`;

  return (
    <div className="canvas-container" ref={containerRef}>
      <svg
        id="faultdraw-canvas"
        ref={svgRef}
        viewBox={viewBox}
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          touchAction: 'none',
          display: 'block',
          background: '#ffffff',
          cursor: tool === 'pan' ? 'grab' : 'crosshair',
        }}
      >
        <ImageLayer />
        {gridVisible && (
          <g id="grid-layer">
            <GridLayer />
          </g>
        )}
        <GeometryLayer />
        <OverlayLayer />
      </svg>
      <ScaleBar />
      <CursorReadout />
      <RulerHud />
    </div>
  );
}
