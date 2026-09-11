<script lang="ts">
  import { resolve } from '$app/paths';
  import { toggleTheme, uiState } from '$lib/state/ui.svelte';

  type OpusSection = 'opus' | 'about' | 'works' | 'services' | 'stack' | 'kaia';

  let {
    active,
    overlay = false,
  }: {
    active: OpusSection;
    overlay?: boolean;
  } = $props();

  const isDark = $derived(uiState.theme === 'dark');

  // linkedin href still placeholder — replace when ready
  const socials = [
    { href: 'https://x.com/aikheandrie', name: 'X' },
    { href: 'https://github.com/aikhe', name: 'github' },
    { href: '#', name: 'linkedin' },
    { href: 'https://www.facebook.com/ikeandrie.rosacay', name: 'facebook' },
  ];
</script>

<div class="opus-side" class:opus-side--overlay={overlay}>
  <nav class="opus-nav" aria-label="Site sections">
    <a
      class="opus-nav__link"
      class:opus-nav__link--active={active === 'opus'}
      href={resolve('/')}
      aria-current={active === 'opus' ? 'page' : undefined}>opus</a
    >
    <a
      class="opus-nav__link"
      class:opus-nav__link--active={active === 'about'}
      href={resolve('/about')}
      aria-current={active === 'about' ? 'page' : undefined}>about</a
    >
    <a
      class="opus-nav__link"
      class:opus-nav__link--active={active === 'works'}
      href={resolve('/works')}
      aria-current={active === 'works' ? 'page' : undefined}>works</a
    >
    <a
      class="opus-nav__link"
      class:opus-nav__link--active={active === 'services'}
      href={resolve('/services')}
      aria-current={active === 'services' ? 'page' : undefined}>services</a
    >
    <a
      class="opus-nav__link"
      class:opus-nav__link--active={active === 'stack'}
      href={resolve('/stack')}
      aria-current={active === 'stack' ? 'page' : undefined}>stack</a
    >
  </nav>
  <!-- future routes — unclickable for now -->
  <nav class="opus-nav opus-nav--soon" aria-label="Upcoming sections">
    <a class="opus-nav__link" href={resolve('/ipse')}>ipse</a>
    <span class="opus-nav__link opus-nav__link--soon">acedia</span>
    <span class="opus-nav__link opus-nav__link--soon">fleur</span>
    <span class="opus-nav__link opus-nav__link--soon">nvim</span>
  </nav>
  <nav class="opus-nav opus-nav--soon" aria-label="More upcoming sections">
    <span class="opus-nav__link opus-nav__link--soon">osn</span>
    <span class="opus-nav__link opus-nav__link--soon">constituent</span>
    <span class="opus-nav__link opus-nav__link--soon">knots</span>
    <span class="opus-nav__link opus-nav__link--soon">katha</span>
  </nav>
  <nav class="opus-kaia" aria-label="Personal agent">
    <p class="opus-kaia__label">
      My personal agent<svg
        class="opus-kaia__arrow"
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M1.5 2.5h6.5v6M5 6.5l3 3 3-3"
          stroke="currentColor"
          stroke-width="1.4"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </p>
    <a
      class="opus-kaia__link"
      class:opus-kaia__link--active={active === 'kaia'}
      href={resolve('/kaia')}
      aria-current={active === 'kaia' ? 'page' : undefined}>kaia</a
    >
  </nav>
  <nav class="opus-socials" aria-label="Social links">
    <p class="opus-socials__label">
      I'm always open,<br />say hi!<svg
        class="opus-socials__arrow"
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M1.5 2.5h6.5v6M5 6.5l3 3 3-3"
          stroke="currentColor"
          stroke-width="1.4"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </p>
    {#each socials as social (social.name)}
      <a
        class="opus-socials__link"
        href={social.href}
        target="_blank"
        rel="noopener noreferrer">{social.name}</a
      >
    {/each}
    <a class="opus-socials__link" href="mailto:ikeandrie.ro@gmail.com"
      >ikeandrie.ro@gmail.com</a
    >
  </nav>
  <button
    class="opus-theme"
    type="button"
    onclick={toggleTheme}
    aria-pressed={isDark}
    aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
  >
    <span class="opus-theme__track" aria-hidden="true">
      <span class="opus-theme__thumb" class:opus-theme__thumb--on={isDark}
      ></span>
    </span>
  </button>
</div>

<style>
  .opus-side {
    left: calc(50vw - 37rem);
    margin-top: -0.12rem;
    position: fixed;
    top: 4.5rem;
    z-index: 5;
  }

  /* static flow when rendered inside the mobile menu overlay */
  .opus-side--overlay {
    left: auto;
    margin-top: 0;
    position: static;
    top: auto;
    z-index: auto;
  }

  .opus-nav {
    align-items: flex-start;
    display: flex;
    flex-direction: column;
    gap: 0.05rem;
  }

  .opus-nav--soon {
    margin-top: 1.4rem;
  }

  .opus-nav__link {
    color: var(--color-text-muted-opus);
    font-family: Geist, sans-serif;
    font-size: 1.08rem;
    font-weight: 500;
    letter-spacing: 0.18%;
    line-height: 1.15;
    text-decoration: none;
    transition: color 0.2s ease;
  }

  .opus-nav__link--active {
    color: var(--color-text);
  }

  .opus-nav__link--soon {
    color: var(--color-text-faint-opus);
    cursor: default;
  }

  .opus-nav__link:not(.opus-nav__link--active, .opus-nav__link--soon):hover {
    color: var(--color-text);
  }

  .opus-theme {
    background: none;
    border: none;
    border-radius: 0;
    cursor: pointer;
    display: block;
    margin-top: 2rem;
    padding: 0;
  }

  .opus-theme:focus-visible {
    outline: 1px solid var(--color-border-solid);
    outline-offset: 3px;
  }

  .opus-theme__track {
    align-items: center;
    background: var(--color-overlay-05);
    border: none;
    border-radius: 0;
    display: flex;
    height: calc(0.7rem + 2px);
    justify-content: flex-start;
    padding: 1px;
    transition: background-color 0.2s ease;
    width: calc(1.4rem + 6px);
  }

  .opus-theme:hover .opus-theme__track {
    background-color: var(--color-overlay-10);
  }

  .opus-theme__thumb {
    background-color: var(--color-text-faint-opus);
    border-radius: 0;
    display: block;
    height: 0.7rem;
    transform: translateX(0);
    transition:
      background-color 0.2s ease,
      transform 0.2s ease;
    width: 0.7rem;
  }

  .opus-theme:hover .opus-theme__thumb {
    background-color: var(--color-text);
  }

  .opus-theme__thumb--on {
    transform: translateX(calc(0.7rem + 4px));
  }

  .opus-socials {
    align-items: flex-start;
    display: flex;
    flex-direction: column;
    gap: 0.05rem;
    margin-top: 1.4rem;
  }

  .opus-kaia {
    align-items: flex-start;
    display: flex;
    flex-direction: column;
    gap: 0.05rem;
    margin-top: 1.4rem;
  }

  .opus-socials__label {
    color: var(--color-text-faint-opus);
    font-family: 'Geist Mono', monospace;
    font-size: 0.8rem;
    font-weight: 400;
    letter-spacing: 0.04em;
    line-height: 1.5;
    margin: 0 0 0.5rem;
    max-width: 100%;
    overflow-wrap: break-word;
  }

  .opus-kaia__label {
    color: var(--color-text-faint-opus);
    font-family: 'Geist Mono', monospace;
    font-size: 0.8rem;
    font-weight: 400;
    letter-spacing: 0.04em;
    line-height: 1.5;
    margin: 0 0 0.5rem;
    max-width: 100%;
    overflow-wrap: break-word;
  }

  .opus-socials__arrow {
    display: inline-block;
    height: 0.8em;
    margin-left: 0.35rem;
    vertical-align: -0.12em;
    width: 0.8em;
  }

  .opus-kaia__arrow {
    display: inline-block;
    height: 0.8em;
    margin-left: 0.35rem;
    vertical-align: -0.12em;
    width: 0.8em;
  }

  .opus-socials__link {
    color: var(--color-text-muted-opus);
    font-family: Geist, sans-serif;
    font-size: 1.08rem;
    font-weight: 500;
    letter-spacing: 0.18%;
    line-height: 1.15;
    max-width: 100%;
    overflow-wrap: break-word;
    text-decoration: none;
    transition: color 0.2s ease;
  }

  .opus-kaia__link {
    color: var(--color-text-muted-opus);
    font-family: Geist, sans-serif;
    font-size: 1.08rem;
    font-weight: 500;
    letter-spacing: 0.18%;
    line-height: 1.15;
    max-width: 100%;
    overflow-wrap: break-word;
    text-decoration: none;
    transition: color 0.2s ease;
  }

  .opus-kaia__link--active {
    color: var(--color-text);
  }

  .opus-kaia__link:not(.opus-kaia__link--active):hover {
    color: var(--color-text);
  }

  .opus-socials__link:hover {
    color: var(--color-text);
  }

  .opus-kaia__link:hover {
    color: var(--color-text);
  }

  /* touch: press states replace hover states */
  @media (hover: none) {
    .opus-nav__link:not(.opus-nav__link--active, .opus-nav__link--soon):hover {
      color: var(--color-text-muted-opus);
    }

    .opus-nav__link:not(.opus-nav__link--active, .opus-nav__link--soon):active {
      color: var(--color-text);
    }

    .opus-theme:hover .opus-theme__track {
      background-color: var(--color-overlay-05);
    }

    .opus-theme:active .opus-theme__track {
      background-color: var(--color-overlay-10);
    }

    .opus-theme:hover .opus-theme__thumb {
      background-color: var(--color-text-faint-opus);
    }

    .opus-theme:active .opus-theme__thumb {
      background-color: var(--color-text);
    }

    .opus-socials__link:hover {
      color: var(--color-text-muted-opus);
    }

    .opus-kaia__link:not(.opus-kaia__link--active):hover {
      color: var(--color-text-muted-opus);
    }

    .opus-socials__link:active {
      color: var(--color-text);
    }

    .opus-kaia__link:not(.opus-kaia__link--active):active {
      color: var(--color-text);
    }
  }
</style>
