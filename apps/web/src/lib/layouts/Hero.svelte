<script lang="ts">
  import Projects from '$lib/components/Info/Projects.svelte';
  import Socials from '$lib/components/Info/Socials.svelte';
  import ProjectView from '$lib/components/Info/ProjectView.svelte';

  let { selectedProjectSize = 0, selectedProject = $bindable(null) } = $props();
  
  function handleDeselect(e: MouseEvent) {
    if (!selectedProject) return;
    const target = e.target as HTMLElement;
    if (!target.closest('.project-view') && !target.closest('.info')) {
      selectedProject = null;
    }
  }
</script>

<svelte:window onmousedown={handleDeselect} />

<div style="display: contents">
  {#if selectedProject}
    <ProjectView project={selectedProject} />
  {:else}
    <div class="hero pointer-events-auto">
      <h1 class="hero__title">
        <strong class="title--strong">Aikhe</strong> is a design engineer of the printing
        and typesetting industry. Lorem Ipsum has been the industry's standard dummy
        text ever since the 1500s.
      </h1>
      <p class="hero__description">
        <strong class="description--strong">CONTRARY TO POPULAR BELIEF,</strong> LOREM
        IPSUM IS NOT SIMPLY RANDOM TEXT. IT HAS ROOTS IN A PIECE OF CLASSICAL LATIN
        LITERATURE FROM 45 BC.
      </p>
    </div>
  {/if}

  <div class="info pointer-events-auto">
    <p class="info__title">CREATIVE PROJECTS I’VE WORKED ON</p>
    <Projects activeProject={selectedProject} onselect={(p: any) => (selectedProject = p)} />
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
  }

  .hero__title {
    font-family: 'GeistPixel Square', sans-serif;
    font-size: 2rem;
    letter-spacing: 0.34%;
    line-height: 34px;
    width: 38ch;
  }

  .title--strong {
    font-family: Advine-Pixel, sans-serif;
    font-size: 4rem;
    letter-spacing: 4%;
  }

  .hero__description {
    color: var(--color-text-muted);
    font-family: 'Geist Mono', monospace;
    font-size: 0.875rem;
    font-weight: 500;
    letter-spacing: 0.34%;
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
    font-family: 'Geist Mono', monospace;
    font-size: 0.875rem;
    font-weight: 500;
    gap: 0.5rem;
    letter-spacing: 0.34%;
  }
</style>
