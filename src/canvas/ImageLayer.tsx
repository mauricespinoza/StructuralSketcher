import { useProjectStore } from '../store/useProjectStore';

/** Imagen de fondo (pertenece conceptualmente a la capa Referencia). */
export function ImageLayer() {
  const image = useProjectStore((s) => s.image);
  const refLayer = useProjectStore((s) =>
    s.layers.find((l) => l.id === 'reference'),
  );
  if (!image || !image.visible || !refLayer?.visible) return null;
  return (
    <image
      id="background-image"
      href={image.dataUrl}
      x={image.x}
      y={image.y}
      width={image.pxWidth * image.scale}
      height={image.pxHeight * image.scale}
      opacity={image.opacity}
      preserveAspectRatio="none"
      pointerEvents="none"
    />
  );
}
