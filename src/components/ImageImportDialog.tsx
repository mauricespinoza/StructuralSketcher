import { useRef } from 'react';
import { useProjectStore } from '../store/useProjectStore';
import { useViewStore } from '../store/useViewStore';

/** Importación de imagen de fondo con opacidad, escala y posición. */
export function ImageImportDialog({ onClose }: { onClose(): void }) {
  const image = useProjectStore((s) => s.image);
  const setImage = useProjectStore((s) => s.setImage);
  const updateImage = useProjectStore((s) => s.updateImage);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      const img = new Image();
      img.onload = () => {
        const { view, size } = useViewStore.getState();
        const worldW = size.w / view.zoom;
        // la imagen entra ocupando ~70% del ancho de la vista
        const scale = (worldW * 0.7) / img.width;
        setImage({
          dataUrl,
          opacity: 0.7,
          x: view.x + worldW * 0.15,
          y: view.y + (size.h / view.zoom - img.height * scale) / 2,
          scale,
          pxWidth: img.width,
          pxHeight: img.height,
          visible: true,
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(f);
  };

  const centerInView = () => {
    if (!image) return;
    const { view, size } = useViewStore.getState();
    const worldW = size.w / view.zoom;
    const worldH = size.h / view.zoom;
    updateImage({
      x: view.x + (worldW - image.pxWidth * image.scale) / 2,
      y: view.y + (worldH - image.pxHeight * image.scale) / 2,
    });
  };

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <h3>🖼 Imagen de fondo</h3>

        <button className="btn" onClick={() => fileRef.current?.click()}>
          {image ? 'Reemplazar imagen…' : 'Elegir imagen…'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={onFile}
        />

        {image && (
          <>
            <label className="field">
              Transparencia · opacidad {(image.opacity * 100).toFixed(0)}%
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={image.opacity}
                onChange={(e) => updateImage({ opacity: Number(e.target.value) })}
              />
            </label>
            <label className="field">
              Escala (m por píxel de imagen)
              <input
                type="number"
                step="any"
                min={0.001}
                value={Number(image.scale.toFixed(4))}
                onChange={(e) =>
                  updateImage({ scale: Math.max(0.0001, Number(e.target.value) || image.scale) })
                }
              />
            </label>
            <div className="field-row">
              <label className="field">
                x (m)
                <input
                  type="number"
                  step="any"
                  value={Math.round(image.x)}
                  onChange={(e) => updateImage({ x: Number(e.target.value) || 0 })}
                />
              </label>
              <label className="field">
                y (m)
                <input
                  type="number"
                  step="any"
                  value={Math.round(image.y)}
                  onChange={(e) => updateImage({ y: Number(e.target.value) || 0 })}
                />
              </label>
            </div>
            <div className="field-row">
              <button className="btn" onClick={centerInView}>
                Centrar en vista
              </button>
              <label className="hud-toggle">
                <input
                  type="checkbox"
                  checked={image.visible}
                  onChange={(e) => updateImage({ visible: e.target.checked })}
                />
                Visible
              </label>
              <button className="btn btn-danger" onClick={() => setImage(null)}>
                Quitar
              </button>
            </div>
          </>
        )}

        <div className="dialog-actions">
          <button className="btn btn-teal" onClick={onClose}>
            Listo
          </button>
        </div>
      </div>
    </div>
  );
}
