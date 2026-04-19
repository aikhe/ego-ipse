export const STAGE_DESIGN_WIDTH = 1920;
export const STAGE_MIN_SCALE = 0.5;

const STAGE_SCALE_CSS_VAR = '--page-stage-scale';
const STAGE_OFFSET_X_CSS_VAR = '--page-stage-offset-x';

export interface StageMetrics {
  height: number;
  isScaled: boolean;
  offsetX: number;
  scale: number;
  width: number;
}

export function getStageScale(): number {
  if (typeof window === 'undefined') return 1;

  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(STAGE_SCALE_CSS_VAR)
    .trim();
  const parsed = Number.parseFloat(value);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export function getStageOffsetX(): number {
  if (typeof window === 'undefined') return 0;

  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(STAGE_OFFSET_X_CSS_VAR)
    .trim();
  const parsed = Number.parseFloat(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

export function toStageValue(value: number): number {
  return value / getStageScale();
}

export function toStageX(value: number): number {
  const scale = getStageScale();
  const offsetX = getStageOffsetX();

  return (value - offsetX) / scale;
}

export function toStageRect(rect: DOMRect | DOMRectReadOnly) {
  const scale = getStageScale();
  const offsetX = getStageOffsetX();

  return {
    bottom: rect.bottom / scale,
    height: rect.height / scale,
    left: (rect.left - offsetX) / scale,
    right: (rect.right - offsetX) / scale,
    top: rect.top / scale,
    width: rect.width / scale,
  };
}

export function calculateStageMetrics(
  viewportWidth: number,
  viewportHeight: number,
  designWidth = STAGE_DESIGN_WIDTH,
  minScale = STAGE_MIN_SCALE
): StageMetrics {
  const rawScale = viewportWidth / designWidth;
  const scale = Math.min(1, Math.max(minScale, rawScale));
  const height = viewportHeight / scale;
  const width = designWidth;
  const offsetX = (viewportWidth - width * scale) / 2;

  return {
    height,
    isScaled: Math.abs(scale - 1) > 0.0005,
    offsetX,
    scale,
    width,
  };
}
