export interface Point {
  x: number;
  y: number;
}

export type LayerId = 'reference' | 'interpretation' | 'faults';

export interface LayerState {
  id: LayerId;
  name: string;
  visible: boolean;
  locked: boolean;
}

export interface Horizon {
  id: string;
  kind: 'horizon';
  layerId: 'reference' | 'interpretation';
  points: Point[];
  color: string;
  unitName?: string;
}

export type FaultType = 'normal' | 'reverse';

export interface Fault {
  id: string;
  kind: 'fault';
  layerId: 'faults';
  points: Point[];
  faultType: FaultType;
}

export type DrawnObject = Horizon | Fault;

export interface BackgroundImage {
  dataUrl: string;
  opacity: number;
  /** esquina superior izquierda en coordenadas de mundo (m) */
  x: number;
  y: number;
  /** metros por pixel de imagen */
  scale: number;
  /** pixeles originales de la imagen */
  pxWidth: number;
  pxHeight: number;
  visible: boolean;
}

/** world -> screen: screen = (world - {x,y}) * zoom ; zoom en px/m */
export interface ViewTransform {
  x: number;
  y: number;
  zoom: number;
}

export type ToolId =
  | 'select'
  | 'horizon'
  | 'faultReverse'
  | 'faultNormal'
  | 'ruler'
  | 'split'
  | 'pan';

export type SplitMode = 'point' | 'trace' | 'intersection';

export interface SnapHit {
  point: Point;
  kind: 'vertex' | 'segment';
  objectId: string;
}

export interface PolylineHit {
  objectId: string;
  point: Point;
  segIndex: number;
  t: number;
  distance: number;
}

export interface Project {
  schemaVersion: 1;
  name: string;
  layers: LayerState[];
  horizons: Horizon[];
  faults: Fault[];
  image: BackgroundImage | null;
  gridVisible: boolean;
  selection: { objectId: string | null; activeFaultId: string | null };
}
