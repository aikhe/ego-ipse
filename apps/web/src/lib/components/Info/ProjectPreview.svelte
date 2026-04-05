<script lang="ts">
  import { tick } from 'svelte';
  import gsap from 'gsap';
  import { runTileReveal } from '$lib/utils/tiles';

  interface Props {
    project?: {
      name: string;
      section: string;
      date: string;
      tags: readonly string[];
      id: string;
      image?: string;
    } | null;
    visible?: boolean;
    posX?: number;
    posY?: number;
    width?: number;
    height?: number;
  }

  let {
    project = null,
    visible = false,
    posX = 0,
    posY = 0,
    width = 260,
    height = 380,
  }: Props = $props();

  let container = $state<HTMLDivElement>();
  let content = $state<HTMLDivElement>();
  let canvas = $state<HTMLCanvasElement>();
  let tl: gsap.core.Timeline | null = null;
  let lastProjectName = $state('');

  const COLS = 20;
  const ROWS = 28;

  $effect(() => {
    if (container) {
      const shouldShow = visible && project;
      if (shouldShow && project) {
        if (project.name !== lastProjectName) {
          lastProjectName = project.name;
          show();
        }
      } else {
        lastProjectName = '';
        hide();
      }
    }
  });

  $effect(() => {
    if (container && (posX || posY)) {
      gsap.to(container, {
        left: posX,
        top: posY,
        duration: 0.4,
        ease: 'power3.out',
      });
    }
  });

  async function show() {
    await tick();
    if (!container) return;

    if (tl) tl.kill();
    tl = gsap.timeline();

    tl.set(container, {
      xPercent: -50,
      yPercent: -100,
      transformOrigin: 'bottom center',
      scaleY: 0,
      y: 0,
    });

    tl.to(container, {
      opacity: 1,
      scaleY: 1,
      y: -12,
      duration: 0.5,
      ease: 'expo.out',
    });

    // hologram flicker
    tl.to(
      container,
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
      runTileReveal(canvas, tl, COLS, ROWS, true, 0.7, '<0.15');
    }
  }

  function hide() {
    if (tl) tl.kill();
    tl = gsap.timeline();

    // fade out content
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
        opacity: 0,
        scaleY: 0,
        y: 0,
        duration: 0.3,
        ease: 'expo.in',
      },
      '-=0.1'
    );
  }
</script>

<div
  class="preview-container"
  bind:this={container}
  style:width="{width}px"
  style:height="{height}px"
>
  <div class="corner-accents"></div>
  {#if project}
    <div class="preview-card" bind:this={content}>
      <div class="header">
        <h3 class="name">{project.name.toUpperCase()} ...</h3>
        <div class="meta">
          <span class="symbol">&gt;</span>
          <span class="section">{project.section}</span>
          <span class="separator">→</span>
          <span class="date">{project.date}</span>
        </div>
      </div>

      <div class="content-area">
        <div class="preview-inner">
          <div class="image-box">
            <img src={project.image} alt={project.name} class="project-image" />
            <canvas bind:this={canvas} class="tile-canvas"></canvas>
          </div>
          <div class="text-footer">
            <div class="tags">
              {#each project.tags as tag, i (i + tag)}
                <span class="tag">[ {tag} ]</span>
              {/each}
            </div>
            <div class="id">{project.id}</div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .preview-container {
    backdrop-filter: blur(4px);
    background: var(--color-bg);
    border: 1px solid var(--color-overlay-20);
    opacity: 0;
    padding: 0;
    pointer-events: none;
    position: absolute;
    z-index: 200;
  }

  .corner-accents {
    inset: -1px;
    pointer-events: none;
    position: absolute;
    z-index: 5;
  }

  .corner-accents::before {
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

  .preview-card {
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;
    z-index: 1;
  }

  .header {
    background: var(--color-overlay-02);
    border-bottom: 1px solid var(--color-overlay-20);
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    font-family: 'Geist Mono', monospace;
    font-size: 0.8rem;
    font-weight: 400;
    gap: 0.44rem;
    letter-spacing: 0.34%;
    padding: 0.8rem;
    position: relative;
  }

  .header::before,
  .header::after {
    bottom: -10px;
    content: '';
    height: 20px;
    pointer-events: none;
    position: absolute;
    width: 10px;
    z-index: 10;
  }

  .header::before {
    background:
      linear-gradient(to right, var(--color-text) 1px, transparent 1px) 0 0,
      linear-gradient(to bottom, var(--color-text) 1px, transparent 1px) 0 50%;
    background-repeat: no-repeat;
    background-size:
      1px 100%,
      100% 1px;
    left: -1px;
  }

  .header::after {
    background:
      linear-gradient(to left, var(--color-text) 1px, transparent 1px) 100% 0,
      linear-gradient(to bottom, var(--color-text) 1px, transparent 1px) 100%
        50%;
    background-repeat: no-repeat;
    background-size:
      1px 100%,
      100% 1px;
    right: -1px;
  }

  .name {
    color: var(--color-text);
    font-weight: 500;
    letter-spacing: 0.08em;
    margin: 0;
  }

  .meta {
    align-items: center;
    color: var(--color-overlay-60);
    display: flex;
    gap: 0.6rem;
  }

  .content-area {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    min-height: 0;
    padding: 0.8rem 0.8rem 0.96rem;
  }

  .preview-inner {
    background: var(--color-bg);
    border: 1px solid var(--color-overlay-20);
    display: flex;
    flex: 1;
    flex-direction: column;
    overflow: hidden;
  }

  .image-box {
    align-items: center;
    display: flex;
    flex: 1;
    justify-content: center;
    min-height: 0;
    position: relative;
    width: 100%;
  }

  .project-image {
    display: block;
    max-height: 100%;
    max-width: 100%;
    object-fit: contain;
  }

  .tile-canvas {
    height: 100%;
    inset: 0;
    pointer-events: none;
    position: absolute;
    width: 100%;
  }

  .text-footer {
    align-items: center;
    background: var(--color-bg);
    border-top: 1px solid var(--color-overlay-20);
    color: var(--color-overlay-60);
    display: flex;
    flex-shrink: 0;
    font-family: 'Geist Mono', monospace;
    font-size: 0.7rem;
    font-weight: 500;
    justify-content: space-between;
    letter-spacing: 0.34%;
    padding: 0.6rem 0.8rem;
  }

  .tags {
    display: flex;
    gap: 0.5rem;
  }

  .tag {
    letter-spacing: 0.05em;
  }

  .id {
    opacity: 0.8;
  }
</style>
