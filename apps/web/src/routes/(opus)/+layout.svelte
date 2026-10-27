<script lang="ts">
  import { page } from '$app/state';
  import { onDestroy } from 'svelte';
  import OpusMobileMenu from '$lib/components/Opus/OpusMobileMenu.svelte';
  import { cancelOpusThemeTransition } from '$lib/utils/opusTheme';
  import type { LayoutProps } from './$types';

  let { children }: LayoutProps = $props();

  onDestroy(() => {
    if (typeof document !== 'undefined') cancelOpusThemeTransition();
  });

  type OpusSection =
    | 'opus'
    | 'about'
    | 'works'
    | 'services'
    | 'stack'
    | 'blogs'
    | 'fleur'
    | 'osn'
    | 'knots'
    | 'nvim'
    | 'kaia';

  const active = $derived.by((): OpusSection => {
    // group prefix is not part of the url: /(opus)/about -> /about
    const id = (page.route.id ?? '/').replace(/^\/\(opus\)/, '') || '/';
    if (id.startsWith('/works')) return 'works';
    if (id === '/about') return 'about';
    if (id === '/services') return 'services';
    if (id === '/stack') return 'stack';
    if (id === '/blogs') return 'blogs';
    if (id === '/fleur') return 'fleur';
    if (id === '/osn') return 'osn';
    if (id === '/knots') return 'knots';
    if (id === '/nvim') return 'nvim';
    if (id === '/kaia') return 'kaia';
    return 'opus';
  });
</script>

<span class="opus-side__note">[Temporary portfolio]</span>
<OpusMobileMenu {active} />
{@render children()}

<style>
  :global(html[data-opus-theme-transition]::view-transition) {
    pointer-events: none;
  }

  :global(html[data-opus-theme-transition]::view-transition-old(root)),
  :global(html[data-opus-theme-transition]::view-transition-new(root)) {
    animation-duration: 250ms;
    animation-timing-function: ease-out;
  }

  :global(html[data-opus-theme-fallback] body),
  :global(html[data-opus-theme-fallback] body *) {
    transition:
      background-color 0.25s ease,
      border-color 0.25s ease,
      color 0.25s ease,
      fill 0.25s ease;
  }

  @media (prefers-reduced-motion: reduce) {
    :global(html[data-opus-theme-transition]::view-transition-old(root)),
    :global(html[data-opus-theme-transition]::view-transition-new(root)) {
      animation-duration: 120ms;
    }
  }

  :global(html) {
    height: auto;
    overflow: auto;
  }

  :global(body) {
    height: auto;
    min-height: 100vh;
    overflow: visible;
  }
</style>
