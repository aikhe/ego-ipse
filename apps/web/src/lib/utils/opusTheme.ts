import { flushSync } from 'svelte';
import { toggleTheme } from '$lib/state/ui.svelte';

let transition: ViewTransition | null = null;
let fallbackTimer: ReturnType<typeof setTimeout> | undefined;

export function cancelOpusThemeTransition() {
  transition?.skipTransition();
  transition = null;
  clearTimeout(fallbackTimer);
  fallbackTimer = undefined;
  delete document.documentElement.dataset.opusThemeTransition;
  delete document.documentElement.dataset.opusThemeFallback;
}

export function toggleOpusTheme() {
  cancelOpusThemeTransition();
  const root = document.documentElement;

  if (!document.startViewTransition) {
    root.dataset.opusThemeFallback = '';
    // commit the transition styles before changing the theme colours.
    void getComputedStyle(document.body).backgroundColor;
    flushSync(toggleTheme);
    fallbackTimer = setTimeout(cancelOpusThemeTransition, 250);
    return;
  }

  root.dataset.opusThemeTransition = '';
  const next = document.startViewTransition(() => flushSync(toggleTheme));
  transition = next;
  // ready rejects when a later click skips the snapshot animation.
  void next.ready.catch(() => {});
  void next.finished
    .catch(() => {
      // a skipped transition still applies its theme update.
    })
    .finally(() => {
      if (transition === next) cancelOpusThemeTransition();
    });
}
