<script lang="ts">
  import { page } from '$app/state';
  import OpusMobileMenu from '$lib/components/Opus/OpusMobileMenu.svelte';
  import type { LayoutProps } from './$types';

  let { children }: LayoutProps = $props();

  type OpusSection =
    | 'opus'
    | 'about'
    | 'works'
    | 'services'
    | 'stack'
    | 'fleur'
    | 'osn'
    | 'nvim'
    | 'kaia';

  const active = $derived.by((): OpusSection => {
    // group prefix is not part of the url: /(opus)/about -> /about
    const id = (page.route.id ?? '/').replace(/^\/\(opus\)/, '') || '/';
    if (id.startsWith('/works')) return 'works';
    if (id === '/about') return 'about';
    if (id === '/services') return 'services';
    if (id === '/stack') return 'stack';
    if (id === '/fleur') return 'fleur';
    if (id === '/osn') return 'osn';
    if (id === '/nvim') return 'nvim';
    if (id === '/kaia') return 'kaia';
    return 'opus';
  });
</script>

<span class="opus-side__note">[Temporary portfolio]</span>
<OpusMobileMenu {active} />
{@render children()}
