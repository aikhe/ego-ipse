export type LayoutMode = 'layered' | 'shader';
export type Theme = 'light' | 'dark';
export type SfxEffect = 'NONE' | 'SMOKE' | 'GRID';

// storage key for the persisted theme choice
const THEME_STORAGE_KEY = 'ego-ipse-theme';

function getStoredTheme(): Theme | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : null;
  } catch {
    return null;
  }
}

function persistTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // storage unavailable (private mode) — theme still works in memory
  }
}

// read the pre-paint value set by the inline script in app.html so the
// first render already matches storage and avoids a light flash
function getInitialTheme(): Theme {
  try {
    if (typeof document !== 'undefined') {
      const attr = document.documentElement.getAttribute('data-theme');
      if (attr === 'light' || attr === 'dark') return attr;
    }
  } catch {
    // fall through to storage
  }
  return getStoredTheme() ?? 'light';
}

export const uiState = $state({
  isProjectView: false,
  gridOverlay: false,
  layoutMode: 'layered' as LayoutMode,
  theme: getInitialTheme(),
  isShaderShifted: false,
  sfxEffect: 'GRID' as SfxEffect,
});

export function setTheme(theme: Theme) {
  uiState.theme = theme;
  persistTheme(theme);
}

// sync in-memory state from storage (call once on mount)
export function initTheme() {
  const stored = getStoredTheme();
  if (stored) uiState.theme = stored;
}

export function toggleTheme() {
  setTheme(uiState.theme === 'dark' ? 'light' : 'dark');
}
