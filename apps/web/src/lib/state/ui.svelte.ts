export type LayoutMode = 'layered' | 'shader';

export const uiState = $state({
  isProjectView: false,
  gridOverlay: false,
  layoutMode: 'shader' as LayoutMode,
});
