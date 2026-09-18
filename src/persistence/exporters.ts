import { downloadBlob } from './projectJson';
import { useProjectStore } from '../store/useProjectStore';

function cleanSvgClone(includeGrid: boolean): SVGSVGElement | null {
  const svg = document.getElementById('faultdraw-canvas') as SVGSVGElement | null;
  if (!svg) return null;
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.querySelector('#overlay-layer')?.remove();
  if (!includeGrid) clone.querySelector('#grid-layer')?.remove();
  const rect = svg.getBoundingClientRect();
  clone.setAttribute('width', String(Math.round(rect.width)));
  clone.setAttribute('height', String(Math.round(rect.height)));
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
  return clone;
}

function projectFileName(): string {
  const name = useProjectStore.getState().name;
  return name.replace(/[^\w\-áéíóúñÁÉÍÓÚÑ ]+/g, '') || 'faultdraw';
}

export function exportSvg(includeGrid = true): void {
  const clone = cleanSvgClone(includeGrid);
  if (!clone) return;
  const text = new XMLSerializer().serializeToString(clone);
  downloadBlob(
    new Blob([text], { type: 'image/svg+xml' }),
    `${projectFileName()}.svg`,
  );
}

export function exportPng(includeGrid = true, scaleFactor = 2): void {
  const clone = cleanSvgClone(includeGrid);
  if (!clone) return;
  const w = Number(clone.getAttribute('width'));
  const h = Number(clone.getAttribute('height'));
  const text = new XMLSerializer().serializeToString(clone);
  const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(text)}`;

  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = w * scaleFactor;
    canvas.height = h * scaleFactor;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, `${projectFileName()}.png`);
    }, 'image/png');
  };
  img.src = svgUrl;
}
