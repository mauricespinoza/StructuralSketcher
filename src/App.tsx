import { useState } from 'react';
import { SvgCanvas } from './canvas/SvgCanvas';
import { TopBar } from './components/TopBar';
import { ToolBar } from './components/ToolBar';
import { RightPanel } from './components/RightPanel';
import { LayerCakeDialog } from './components/LayerCakeDialog';
import { ImageImportDialog } from './components/ImageImportDialog';

export default function App() {
  const [layerCakeOpen, setLayerCakeOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);

  return (
    <div className="app">
      <TopBar
        onOpenLayerCake={() => setLayerCakeOpen(true)}
        onOpenImage={() => setImageOpen(true)}
        onTogglePanel={() => setPanelOpen((v) => !v)}
      />
      <div className="main">
        <ToolBar />
        <SvgCanvas />
        <RightPanel open={panelOpen} />
      </div>
      {layerCakeOpen && <LayerCakeDialog onClose={() => setLayerCakeOpen(false)} />}
      {imageOpen && <ImageImportDialog onClose={() => setImageOpen(false)} />}
    </div>
  );
}
