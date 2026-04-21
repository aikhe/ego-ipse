<script lang="ts">
  import { onMount } from 'svelte';
  import Projects from '$lib/components/Info/Projects.svelte';
  import Socials from '$lib/components/Info/Socials.svelte';
  import ProjectView from '$lib/components/Info/ProjectView.svelte';

  import type { Project } from '$lib/types/project';

  import { splitTextCustom } from '$lib/utils/splitText';
  import { uiState } from '$lib/state/ui.svelte';
  import gsap from 'gsap';

  let { selectedProject = $bindable(null) } = $props();

  let nextProject: Project | null = $state(null);
  let titleEl: HTMLElement | undefined = $state();
  let descEl: HTMLElement | undefined = $state();

  let isAnimating = $state(false);
  let titleSplit = $state(false);
  let isReadyToAnimate = $state(false);

  // split text once on mount
  onMount(async () => {
    // Wait for fonts to load to ensure accurate offsetTop calculations
    await document.fonts.ready;

    if (titleEl && !titleSplit) {
      splitTextCustom(titleEl);
      titleSplit = true;

      // Warm up GSAP and record initial state to prevent first-run jitter
      const chars = titleEl.querySelectorAll('.char');
      gsap.set(chars, { yPercent: 0, force3D: true });
    }

    if (descEl) {
      splitTextCustom(descEl, { clipDirection: 'horizontal' });
      const chars = descEl.querySelectorAll('.char');
      gsap.set(chars, { xPercent: 0, force3D: true });
    }

    // Give browser a frame to settle layout before showing
    requestAnimationFrame(() => {
      isReadyToAnimate = true;
    });
  });

  function buildTitleTimeline(direction: 'out' | 'in'): gsap.core.Timeline {
    const tl = gsap.timeline();
    if (!titleEl) return tl;

    const lines = Array.from(titleEl.querySelectorAll('.line'));
    if (!lines.length) return tl;

    if (direction === 'out') {
      lines.forEach((line, index) => {
        const chars = Array.from(line.querySelectorAll('.char'));
        tl.to(
          chars,
          {
            yPercent: 200,
            duration: 0.6,
            ease: 'power4.inOut',
            force3D: true,
            stagger: { amount: 0.2, from: 'end' },
          },
          index * 0.05
        );
      });
    } else {
      const reversed = [...lines].reverse();
      reversed.forEach((line, index) => {
        const chars = Array.from(line.querySelectorAll('.char'));
        tl.fromTo(
          chars,
          { yPercent: 200 },
          {
            yPercent: 0,
            duration: 0.6,
            ease: 'power4.inOut',
            force3D: true,
            stagger: { amount: 0.2, from: 'start' },
          },
          index * 0.05
        );
      });
    }
    return tl;
  }

  function buildDescTimeline(direction: 'out' | 'in'): gsap.core.Timeline {
    const tl = gsap.timeline();
    if (!descEl) return tl;

    const lines = Array.from(descEl.querySelectorAll('.line'));
    if (!lines.length) return tl;

    if (direction === 'out') {
      lines.forEach((line, index) => {
        const chars = Array.from(line.querySelectorAll('.char'));
        tl.to(
          chars,
          {
            xPercent: -200,
            duration: 0.6,
            ease: 'expo.inOut',
            force3D: true,
            stagger: { amount: 0.2, from: 'end' },
          },
          index * 0.08
        );
      });
    } else {
      const reversed = [...lines].reverse();
      reversed.forEach((line, index) => {
        const chars = Array.from(line.querySelectorAll('.char'));
        tl.fromTo(
          chars,
          { xPercent: -200 },
          {
            xPercent: 0,
            duration: 0.6,
            ease: 'expo.inOut',
            force3D: true,
            stagger: { amount: 0.2, from: 'start' },
          },
          index * 0.08
        );
      });
    }
    return tl;
  }

  async function triggerHeroOut(project: Project) {
    if (isAnimating) return;
    isAnimating = true;
    nextProject = project;

    const titleTl = buildTitleTimeline('out');
    const descTl = buildDescTimeline('out');

    const master = gsap.timeline({
      onComplete: () => {
        selectedProject = nextProject;
        nextProject = null;
        isAnimating = false;
      },
    });
    master.add(titleTl, 0);
    master.add(descTl, 0);
  }

  async function triggerHeroIn() {
    if (isAnimating) return;
    isAnimating = true;

    selectedProject = null;

    // wait a tick for DOM update
    await new Promise(r => requestAnimationFrame(r));

    const descTl = buildDescTimeline('in');
    const titleTl = buildTitleTimeline('in');

    const master = gsap.timeline({
      onComplete: () => {
        isAnimating = false;
      },
    });
    master.add(descTl, 0);
    master.add(titleTl, 0);
  }

  function handleDeselect(e: MouseEvent) {
    if (!selectedProject && !nextProject) return;
    const target = e.target as HTMLElement;
    if (
      !target.closest('.project-view') &&
      !target.closest('.info') &&
      !target.closest('.poster-overlay')
    ) {
      triggerHeroIn();
    }
  }
</script>

<svelte:window onpointerdown={handleDeselect} />

<div style="display: contents">
  {#if uiState.isProjectView && selectedProject}
    <ProjectView project={selectedProject} />
  {/if}

  <div
    class="hero pointer-events-auto"
    class:hero--hidden={uiState.isProjectView}
    class:hero--ready={isReadyToAnimate}
  >
    <h1 class="hero__title font--hero-title" bind:this={titleEl}>
      <strong class="title--strong font--hero-accent">Aikhe</strong> is a design engineer
      of the printing and typesetting industry. Lorem Ipsum has been the industry's
      standard dummy text ever since the 1500s.
    </h1>
    <p class="hero__description font--mono-label" bind:this={descEl}>
      <strong class="description--strong">CONTRARY TO POPULAR BELIEF,</strong> LOREM
      IPSUM IS NOT SIMPLY RANDOM TEXT. IT HAS ROOTS IN A PIECE OF CLASSICAL LATIN
      LITERATURE FROM 45 BC.
    </p>
  </div>

  <div class="info pointer-events-auto">
    <p class="info__title font--mono-label">CREATIVE PROJECTS I'VE WORKED ON</p>
    <Projects
      activeProject={selectedProject || nextProject}
      isReady={uiState.isProjectView}
      onselect={(p: Project) => {
        if (!selectedProject && !isAnimating) {
          triggerHeroOut(p);
        } else if (selectedProject) {
          selectedProject = p;
        }
      }}
    />
    <Socials />
  </div>
</div>

<style>
  .hero {
    display: flex;
    flex-direction: column;
    gap: 2.4rem;
    grid-column: 1 / span 10;
    grid-row: 1;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .hero--ready {
    opacity: 1;
  }

  .hero--hidden {
    pointer-events: none;
  }

  :global(.char) {
    backface-visibility: hidden;
    transform: translate3d(0, 0, 0);
    will-change: transform;
  }

  .hero__title {
    width: 38ch;
  }

  .hero__description {
    color: var(--color-text-muted);
    line-height: 16px;
    width: 48ch;
  }

  .description--strong {
    color: var(--color-text);
    font-weight: 500;
  }

  .info {
    display: flex;
    flex-direction: column;
    gap: 0.88rem;
    grid-column: 7 / span 6;
    grid-row: 1;
    position: relative;
  }

  .info__title {
    align-items: center;
    color: var(--color-text-muted);
    display: flex;
    gap: 0.5rem;
  }
</style>
