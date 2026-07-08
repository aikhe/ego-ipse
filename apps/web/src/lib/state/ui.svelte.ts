export type LayoutMode = 'layered' | 'smoke';

export const uiState = $state({
  isProjectView: false,
  gridOverlay: false,
  layoutMode: 'layered' as LayoutMode,
});
