<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { page } from '$app/state';
  import OpusNav from '$lib/components/Opus/OpusNav.svelte';

  type OpusSection = 'opus' | 'about' | 'works' | 'services' | 'stack' | 'kaia';

  let { active }: { active: OpusSection } = $props();

  let open = $state(false);
  let triggerEl = $state<HTMLButtonElement | null>(null);
  let overlayEl = $state<HTMLDivElement | null>(null);
  let panelEl = $state<HTMLDivElement | null>(null);

  function close() {
    open = false;
  }

  // the menu lives in the layout and outlives route changes.
  $effect(() => {
    if (page.url.pathname !== '') open = false;
  });

  function closeOnEscape(event: KeyboardEvent) {
    if (open && event.key === 'Escape') close();
  }

  // modal semantics need entry, trap and restore around the trigger.
  function trapTab(event: KeyboardEvent) {
    if (event.key !== 'Tab' || !overlayEl) return;
    const items = overlayEl.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
    );
    const first = items.item(0);
    const last = items.item(items.length - 1);
    if (!first || !last) return;
    const active = document.activeElement;
    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  $effect(() => {
    if (!open) return;
    panelEl?.focus();
    return () => {
      if (triggerEl && document.contains(triggerEl)) triggerEl.focus();
    };
  });

  $effect(() => {
    if (!open) return;
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
    };
  });
</script>

<svelte:window onkeydown={closeOnEscape} />

<button
  class="opus-menu__btn"
  class:opus-menu__btn--open={open}
  type="button"
  bind:this={triggerEl}
  onclick={() => (open = !open)}
  aria-expanded={open}
  aria-controls="opus-menu-overlay"
  aria-label={open ? 'Close menu' : 'Open menu'}
>
  <span>{open ? 'Close' : 'Menu'}</span>
</button>

{#if open}
  <div
    id="opus-menu-overlay"
    class="opus-menu__overlay"
    bind:this={overlayEl}
    role="dialog"
    aria-modal="true"
    aria-label="Site menu"
    tabindex="-1"
    onkeydown={trapTab}
    transition:fade={{ duration: 180 }}
  >
    <button
      class="opus-menu__backdrop"
      type="button"
      aria-label="Close menu"
      onclick={close}
    ></button>
    <div
      class="opus-menu__panel"
      bind:this={panelEl}
      tabindex="-1"
      transition:fly={{ x: 48, duration: 220 }}
    >
      <OpusNav {active} overlay={true} />
      <span class="opus-menu__note">[Temporary portfolio]</span>
    </div>
  </div>
{/if}

<style>
  .opus-menu__btn {
    align-items: center;
    background: none;
    border: none;
    border-radius: 0;
    color: var(--color-text);
    cursor: pointer;
    display: none;
    font-family: Geist, sans-serif;
    font-size: 1.08rem;
    font-weight: 500;
    letter-spacing: 0.18%;
    line-height: 1.15;
    min-height: 2rem;
    padding: 0;
    position: fixed;
    right: 1rem;
    top: 1rem;
    z-index: 60;
  }

  .opus-menu__btn:active {
    opacity: 0.55;
  }

  .opus-menu__btn:focus-visible {
    outline: 1px solid var(--color-border-solid);
    outline-offset: 2px;
  }

  .opus-menu__overlay {
    inset: 0;
    position: fixed;
    z-index: 55;
  }

  .opus-menu__backdrop {
    background: color-mix(in srgb, var(--color-bg) 72%, transparent);
    border: none;
    cursor: default;
    display: block;
    height: 100%;
    padding: 0;
    width: 100%;
  }

  .opus-menu__panel {
    background: var(--color-bg);
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-y: auto;
    padding: 4.5rem 1.5rem 3rem;
    position: absolute;
    right: 0;
    top: 0;
    width: min(20rem, 84vw);
  }

  .opus-menu__note {
    color: var(--color-text-faint-opus);
    font-family: 'Geist Mono', monospace;
    font-size: 0.8rem;
    font-weight: 400;
    letter-spacing: 0.04em;
    line-height: 1;
    margin: auto 0 0;
    padding-top: 2rem;
    white-space: nowrap;
  }

  /* shown once the nav sidebar hides (see opus layout breakpoints) */
  @media (max-width: 63rem) {
    .opus-menu__btn {
      display: inline-flex;
    }
  }
</style>
