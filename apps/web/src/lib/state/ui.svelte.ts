export type LayoutMode = 'layered' | 'shader';
export type Theme = 'light' | 'dark';
export type SfxEffect = 'NONE' | 'SMOKE' | 'GRID';

export const uiState = $state({
  isProjectView: false,
  gridOverlay: false,
  layoutMode: 'layered' as LayoutMode,
  theme: 'light' as Theme,
  isShaderShifted: false,
  sfxEffect: 'GRID' as SfxEffect,
});

export function toggleTheme() {
  uiState.theme = uiState.theme === 'dark' ? 'light' : 'dark';
}
