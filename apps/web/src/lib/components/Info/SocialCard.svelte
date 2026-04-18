<script lang="ts">
  import { tick } from 'svelte';
  import gsap from 'gsap';
  import { runTileReveal } from '$lib/utils/tiles';

  interface Social {
    name: string;
    href: string;
    external: boolean;
    handle?: string;
    bioPrefix?: string;
    bioHighlight?: string;
    stats?: { label: string; value: string }[];
    tags?: string[];
    status?: string;
    image?: string;
  }

  interface Props {
    social?: Social | null;
    visible?: boolean;
  }

  let { social = null, visible = false }: Props = $props();

  let container = $state<HTMLDivElement>();
  let content = $state<HTMLDivElement>();
  let canvas = $state<HTMLCanvasElement>();
  let tl: gsap.core.Timeline | null = null;
  let lastName = '';
  let displaySocial = $state<Social | null>(null);

  const COLS = 20;
  const ROWS = 20;

  $effect(() => {
    if (container) {
      if (visible && social) {
        if (social.name !== lastName) {
          displaySocial = social;
          lastName = social.name;
          show();
        }
      } else if (!visible && lastName !== '') {
        lastName = '';
        hide();
      }
    }
  });

  async function show() {
    await tick();
    if (!container) return;

    if (tl) tl.kill();
    tl = gsap.timeline();

    tl.set(container!, {
      transformOrigin: 'bottom left',
      scaleY: 0,
      y: 10,
    });

    tl.to(container!, {
      opacity: 1,
      scaleY: 1,
      y: 0,
      duration: 0.5,
      ease: 'expo.out',
    });

    // hologram flicker
    tl.to(
      container!,
      {
        duration: 0.05,
        repeat: 3,
        yoyo: true,
        ease: 'none',
      },
      '<0.1'
    );

    if (content) {
      tl.fromTo(
        content.children,
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.05,
          ease: 'power2.out',
        },
        '-=0.2'
      );
    }

    if (canvas) {
      runTileReveal(canvas, tl, COLS, ROWS, true, 0.6, '<0.15');
    }
  }

  function hide() {
    if (!container) return;
    if (tl) tl.kill();
    tl = gsap.timeline();

    if (content) {
      tl.to(content.children, {
        opacity: 0,
        y: -5,
        duration: 0.2,
        stagger: 0.03,
        ease: 'power2.in',
      });
    }

    if (canvas && tl) {
      runTileReveal(canvas, tl, COLS, ROWS, false, 0.25, '<');
    }

    // collapse container
    tl.to(
      container!,
      {
        scaleY: 0,
        y: 10,
        duration: 0.3,
        ease: 'expo.in',
      },
      '-=0.1'
    );
  }
</script>

<div class="social-card" bind:this={container}>
  <div class="social-card__accents"></div>
  {#if displaySocial}
    <div class="social-card__inner" bind:this={content}>
      <div class="social-card__side social-card__side--left">
        <div class="social-card__user">
          <p class="social-card__handle">
            {displaySocial.handle || '@aikheandrei'}
          </p>
          <p class="social-card__bio">
            &gt; {displaySocial.bioPrefix || 'BIO'}
            <strong class="social-card__bio--strong"
              >{displaySocial.bioHighlight || '→ CREATIVE DEV'}</strong
            >
          </p>
        </div>
        <div class="social-card__stats">
          {#if displaySocial.stats}
            {#each displaySocial.stats as stat (stat.label)}
              <div class="social-card__stat">
                <span class="social-card__stat-label">{stat.label}:</span>
                <span class="social-card__stat-val">[{stat.value}]</span>
              </div>
            {/each}
          {:else}
            <div class="social-card__stat">
              <span class="social-card__stat-label">FOLLOWING:</span>
              <span class="social-card__stat-val">[939]</span>
            </div>
            <div class="social-card__stat">
              <span class="social-card__stat-label">FOLLOWERS:</span>
              <span class="social-card__stat-val">[4,426]</span>
            </div>
            <div class="social-card__stat">
              <span class="social-card__stat-label">LEVEL:</span>
              <span class="social-card__stat-val">[99]</span>
            </div>
            <div class="social-card__stat">
              <span class="social-card__stat-label">RANK:</span>
              <span class="social-card__stat-val">[S]</span>
            </div>
          {/if}
        </div>
        <div class="social-card__bottom">
          <div class="social-card__tags">
            {#if displaySocial.tags}
              {#each displaySocial.tags as tag (tag)}
                <span class="social-card__tag font--mono-tag-regular">[ {tag} ]</span>
              {/each}
            {:else}
              <span class="social-card__tag font--mono-tag-regular">[ {displaySocial.name} ]</span>
              <span class="social-card__tag font--mono-tag-regular"
                >[ {displaySocial.external ? 'SOCIAL' : 'INTERNAL'} ]</span
              >
            {/if}
          </div>
          <button class="social-card__status">
            {displaySocial.status || 'ACTIVE...'}
          </button>
        </div>
      </div>
      <div class="social-card__side social-card__side--right">
        <div class="social-card__preview">
          <img
            src={displaySocial.image}
            alt="Preview"
            class="social-card__img"
          />
          <div class="social-card__dot social-card__dot--tl"></div>
          <div class="social-card__dot social-card__dot--tr"></div>
          <div class="social-card__dot social-card__dot--bl"></div>
          <div class="social-card__dot social-card__dot--br"></div>
          <canvas bind:this={canvas} class="social-card__canvas"></canvas>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .social-card {
    backdrop-filter: blur(4px);
    background: var(--color-bg);
    border: 1px solid var(--color-overlay-20);
    bottom: calc(100% - 1rem);
    height: auto;
    opacity: 0;
    pointer-events: none;
    position: absolute;
    right: 0;
    transform-origin: bottom left;
    width: calc(50% - 0.6rem); /* 3 grid columns */
    z-index: 999;
  }

  .social-card__accents {
    inset: -1px;
    pointer-events: none;
    position: absolute;
    z-index: 5;
  }

  .social-card__accents::before {
    background:
      linear-gradient(to right, var(--color-text) 1px, transparent 1px) 0 0,
      linear-gradient(to bottom, var(--color-text) 1px, transparent 1px) 0 0,
      linear-gradient(to left, var(--color-text) 1px, transparent 1px) 100% 0,
      linear-gradient(to bottom, var(--color-text) 1px, transparent 1px) 100% 0,
      linear-gradient(to right, var(--color-text) 1px, transparent 1px) 0 100%,
      linear-gradient(to top, var(--color-text) 1px, transparent 1px) 0 100%,
      linear-gradient(to left, var(--color-text) 1px, transparent 1px) 100% 100%,
      linear-gradient(to top, var(--color-text) 1px, transparent 1px) 100% 100%;
    background-repeat: no-repeat;
    background-size: 10px 10px;
    content: '';
    inset: 0;
    position: absolute;
  }

  .social-card__inner {
    display: grid;
    gap: 1rem;
    grid-template-columns: 1fr 1fr;
    min-height: 12.5rem;
    padding: 1rem;
  }

  .social-card__side--left {
    display: flex;
    flex-direction: column;
    font-family: 'Geist Mono', monospace;
    justify-content: space-between;
  }

  .social-card__user {
    display: flex;
    flex-direction: column;
    row-gap: 0.24rem;
  }

  .social-card__handle {
    color: var(--color-text);
    font-family: 'Geist Mono', monospace;
    font-size: 0.8rem;
    font-weight: 400;
    letter-spacing: 0.034em;
    margin: 0;
  }

  .social-card__bio {
    color: var(--color-overlay-60);
    font-family: 'Geist Mono', monospace;
    font-size: 0.8rem;
    font-weight: 400;
    letter-spacing: 0.034em;
    margin: 0.1rem 0 0;
    text-wrap: nowrap;
  }

  .social-card__bio--strong {
    color: var(--color-text);
    font-weight: 400;
  }

  .social-card__stats {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    margin: 0.4rem 0;
  }

  .social-card__stat {
    display: flex;
    font-family: 'Geist Mono', monospace;
    font-size: 0.8rem;
    font-weight: 400;
    gap: 1.86rem;
    justify-content: flex-start;
    letter-spacing: 0.034em;
    line-height: 1.2;
  }

  .social-card__stat-label {
    color: var(--color-overlay-60);
    flex-shrink: 0;
    width: 85px;
  }

  .social-card__stat-val {
    color: var(--color-text);
    flex-grow: 1;
  }

  .social-card__bottom {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    margin-top: auto;
  }

  .social-card__tags {
    display: flex;
    gap: 0.4rem;
  }

  .social-card__tag {
    color: var(--color-text);
    white-space: nowrap;
  }

  .social-card__status {
    background: var(--color-overlay-02);
    border: 1px solid var(--color-overlay-20);
    color: var(--color-overlay-60);
    cursor: default;
    font-family: 'Geist Mono', monospace;
    font-size: 0.8rem;
    font-weight: 400;
    letter-spacing: 0.034em;
    padding: 0.24rem;
    text-align: center;
    transition: background 0.2s ease;
    width: 100%;
  }

  .social-card__side--right {
    align-items: center;
    display: flex;
    justify-content: center;
  }

  .social-card__preview {
    align-items: center;
    aspect-ratio: 1 / 1;
    background: var(--color-bg);
    border: 1px dashed var(--color-overlay-60);
    display: flex;
    justify-content: center;
    overflow: visible;
    position: relative;
    width: 100%;
  }

  .social-card__img {
    display: block;
    max-height: 100%;
    max-width: 100%;
    object-fit: contain;
  }

  .social-card__dot {
    background: var(--color-text);
    height: 4px;
    position: absolute;
    width: 4px;
    z-index: 100;
  }

  .social-card__dot--tl {
    left: -1px;
    top: -1px;
  }

  .social-card__dot--tr {
    right: -1px;
    top: -1px;
  }

  .social-card__dot--bl {
    bottom: -1px;
    left: -1px;
  }

  .social-card__dot--br {
    bottom: -1px;
    right: -1px;
  }

  .social-card__canvas {
    height: 100%;
    inset: 0;
    pointer-events: none;
    position: absolute;
    width: 100%;
  }
</style>
