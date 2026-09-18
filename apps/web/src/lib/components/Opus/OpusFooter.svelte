<script lang="ts">
  import { resolve } from '$app/paths';

  let {
    ref = $bindable<HTMLDivElement | null>(null),
    showCard = true,
  }: { ref?: HTMLDivElement | null; showCard?: boolean } = $props();

  let now = $state(new Date());

  const manilaTime = $derived(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Manila',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
      .format(now)
      .replace(/\s?(AM|PM)/i, m => m.trim().toLowerCase())
  );

  $effect(() => {
    const t = setInterval(() => (now = new Date()), 5000);
    return () => clearInterval(t);
  });
</script>

<div class="opus-section opus-section--footer opus-footer" bind:this={ref}>
  {#if showCard}
    <a
      class="opus-footer__card"
      href={resolve('/services')}
      aria-label="View services"
    >
      <span class="opus-footer__top">
        <span class="opus-footer__title">Services</span>
        <svg
          class="opus-footer__arrow"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="m6.5 17.5 11-11m0 9v-9h-9" />
        </svg>
      </span>
      <p class="opus-footer__desc">
        Freelance design, development, and creative support for startups and
        small teams. See my services here.
      </p>
    </a>
  {/if}
  <p class="opus-footer__bar">
    <span>© 2026 Ike Andrie Rosacay</span>
    <span>{manilaTime} in Caloocan, Philippines</span>
  </p>
</div>

<style>
  /* col-3 (36rem) + col-4 (12rem) + border */
  .opus-section--footer {
    margin-top: 8rem;
    position: relative;
    width: calc(48rem + 2px);
    z-index: 1;
  }

  .opus-footer {
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
  }

  /* 90% of col-3 (36rem) */
  .opus-footer__card {
    background: var(--color-overlay-03);
    box-sizing: border-box;
    color: inherit;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.75rem 1rem;
    position: relative;
    text-decoration: none;
    transition: background-color 0.15s ease;
    width: 32.4rem;
  }

  .opus-footer__card::after {
    background-image:
      linear-gradient(var(--color-border-corner), var(--color-border-corner)),
      linear-gradient(var(--color-border-corner), var(--color-border-corner)),
      linear-gradient(var(--color-border-corner), var(--color-border-corner)),
      linear-gradient(var(--color-border-corner), var(--color-border-corner));
    background-position:
      0 0,
      100% 0,
      0 100%,
      100% 100%;
    background-repeat: no-repeat;
    background-size: 3px 10px;
    content: '';
    inset: 0;
    opacity: 0;
    pointer-events: none;
    position: absolute;
    transition: opacity 0.15s ease;
  }

  .opus-footer__card:hover {
    background-color: var(--color-overlay-05);
  }

  .opus-footer__card:hover::after {
    opacity: 1;
  }

  .opus-footer__top {
    align-items: center;
    display: flex;
    gap: 0.25rem;
  }

  .opus-footer__arrow {
    color: var(--color-text);
    display: block;
    flex-shrink: 0;
    height: 1.125rem;
    width: 1.125rem;
  }

  .opus-footer__title {
    color: var(--color-text);
    font-family: Geist, sans-serif;
    font-size: 1.08rem;
    font-weight: 500;
    letter-spacing: 0.18%;
    line-height: 1.48;
    margin: 0;
  }

  .opus-footer__desc {
    color: var(--color-text-muted-opus);
    font-family: Geist, sans-serif;
    font-size: 1.08rem;
    font-weight: 400;
    letter-spacing: 0.18%;
    line-height: 1.48;
    margin: 0;
    max-width: 92%;
  }

  .opus-footer__bar {
    color: var(--color-text-faint-opus);
    display: flex;
    font-family: Geist, sans-serif;
    font-size: 0.92rem;
    font-weight: 400;
    justify-content: space-between;
    letter-spacing: 0.18%;
    line-height: 1.5;
    margin: 0;
  }

  /* touch: press states replace hover states */
  @media (hover: none) {
    .opus-footer__card:hover {
      background-color: var(--color-overlay-03);
    }

    .opus-footer__card:active {
      background-color: var(--color-overlay-05);
    }

    .opus-footer__card:hover::after {
      opacity: 0;
    }

    .opus-footer__card:active::after {
      opacity: 1;
    }
  }

  /* mobile: match the nvim card type step-down */
  @media (max-width: 48rem) {
    .opus-footer__title,
    .opus-footer__desc {
      font-size: 1rem;
    }
  }
</style>
