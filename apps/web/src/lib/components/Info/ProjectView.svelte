<script lang="ts">
  import { tick } from 'svelte';
  import gsap from 'gsap';
  import { runTileReveal } from '$lib/utils/tiles';
  import type { Project } from '$lib/types/project';

  interface Props {
    project: Project | null;
    visible?: boolean;
  }

  let { project, visible = false }: Props = $props();
  let viewEl: HTMLDivElement;
  let innerEl: HTMLDivElement;
  let content: HTMLDivElement;
  let canvas: HTMLCanvasElement;
  let tl: gsap.core.Timeline | null = null;
  let showContent = $state(!!project);

  const COLS = 18;
  const ROWS = 24;

  $effect(() => {
    if (visible) {
      showContent = true;
      show();
    } else {
      hide();
    }
  });

  async function show() {
    if (tl) { tl.kill(); tl = null; }
    if (!viewEl || !innerEl) return;

    viewEl.style.display = 'flex';
    await tick();

    tl = gsap.timeline({
      delay: 0.15, // a tiny responsive delay for perfect pacing
    });

    tl.set(innerEl, {
      transformOrigin: 'center center',
      scaleY: 0,
      opacity: 0,
    });

    // scale in
    tl.to(innerEl, {
      opacity: 1,
      scaleY: 1,
      duration: 0.5,
      ease: 'expo.out',
    });

    // hologram flicker
    tl.to(
      innerEl,
      {
        duration: 0.05,
        repeat: 3,
        yoyo: true,
        ease: 'none',
      },
      '<0.1'
    );

    // content stagger
    if (content && content.children.length) {
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

    // tile reveal
    if (canvas) {
      runTileReveal(canvas, tl, COLS, ROWS, true, 0.7, '<0.15');
    }
  }

  function hide() {
    if (tl) { tl.kill(); tl = null; }
    if (!viewEl || !innerEl) return;

    tl = gsap.timeline({
      onComplete: () => {
        viewEl.style.display = 'none';
        showContent = false;
      },
    });

    // fade out content
    if (content && content.children.length) {
      tl.to(content.children, {
        opacity: 0,
        y: -5,
        duration: 0.2,
        stagger: 0.03,
        ease: 'power2.in',
      });
    }

    // tile hide
    if (canvas) {
      runTileReveal(canvas, tl, COLS, ROWS, false, 0.25, '<');
    }

    // collapse container
    tl.to(
      innerEl,
      {
        opacity: 0,
        scaleY: 0,
        duration: 0.3,
        ease: 'expo.in',
      },
      '-=0.1'
    );
  }
</script>

<div class="project-view" bind:this={viewEl}>
  <div class="project-view-inner" bind:this={innerEl}>
    <canvas bind:this={canvas} class="tile-canvas"></canvas>
    <div class="corner-accents"></div>
    {#if showContent && project}
      <div class="project-content" bind:this={content}>
        <!-- Content will be added here later -->
        <!-- <div class="placeholder"> -->
        <!--   <h2>{project.name}</h2> -->
        <!--   <p>{project.section}</p> -->
        <!-- </div> -->
      </div>
    {/if}
  </div>
</div>

<style>
  .project-view {
    display: none;
    grid-column: 1 / span 6;
    grid-row: 1;
    height: var(--page-stage-height, 100vh);
    left: 0;
    position: absolute;
    top: calc(-4.8rem); /* offset header height */
    width: 100%;
    z-index: 100;
  }

  .project-view-inner {
    background: var(--color-bg);
    border-left: 1px dashed #3a3a3a;
    border-right: 1px dashed #3a3a3a;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    padding: 2.4rem;
    position: relative;
    width: 100%;
  }

  .tile-canvas {
    height: 100%;
    inset: 0;
    pointer-events: none;
    position: absolute;
    width: 100%;
  }

  .corner-accents {
    inset: 0;
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
    background-size: 12px 12px;
    content: '';
    inset: 0 -1px;
    position: absolute;
  }

  .project-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;
    width: 100%;
    z-index: 1;
  }

  /* .placeholder {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding-top: 2rem;
  }

  h2 {
    font-size: 3rem;
    font-weight: 600;
    letter-spacing: -0.02em;
    margin: 0;
    text-transform: uppercase;
  }

  p {
    color: var(--color-text-muted);
    font-family: 'Geist Mono', monospace;
    font-size: 1rem;
    margin: 0;
  } */
</style>
