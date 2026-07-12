export type LayoutMode = 'layered' | 'shader';
export type Theme = 'light' | 'dark';

export const uiState = $state({
  isProjectView: false,
  gridOverlay: false,
  layoutMode: 'shader' as LayoutMode,
  theme: 'light' as Theme,
});

export function toggleTheme() {
  uiState.theme = uiState.theme === 'dark' ? 'light' : 'dark';
}
