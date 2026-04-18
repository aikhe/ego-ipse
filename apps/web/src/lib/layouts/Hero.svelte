<script lang="ts">
  import Projects from '$lib/components/Info/Projects.svelte';
  import Socials from '$lib/components/Info/Socials.svelte';
  import ProjectView from '$lib/components/Info/ProjectView.svelte';

  import type { Project } from '$lib/types/project';

  let { selectedProject = $bindable(null) } = $props();

  function handleDeselect(e: MouseEvent) {
    if (!selectedProject) return;
    const target = e.target as HTMLElement;
    if (
      !target.closest('.project-view') &&
      !target.closest('.info') &&
      !target.closest('.poster-overlay')
    ) {
      selectedProject = null;
    }
  }
</script>

<svelte:window onpointerdown={handleDeselect} />

<div style="display: contents">
  {#if selectedProject}
    <ProjectView project={selectedProject} />
  {:else}
    <div class="hero pointer-events-auto">
      <h1 class="hero__title font--hero-title">
        <strong class="title--strong font--hero-accent">Aikhe</strong> is a design engineer of the printing
        and typesetting industry. Lorem Ipsum has been the industry's standard dummy
        text ever since the 1500s.
      </h1>
      <p class="hero__description font--mono-label">
        <strong class="description--strong">CONTRARY TO POPULAR BELIEF,</strong> LOREM
        IPSUM IS NOT SIMPLY RANDOM TEXT. IT HAS ROOTS IN A PIECE OF CLASSICAL LATIN
        LITERATURE FROM 45 BC.
      </p>
    </div>
  {/if}

  <div class="info pointer-events-auto">
    <p class="info__title font--mono-label">CREATIVE PROJECTS I’VE WORKED ON</p>
    <Projects
      activeProject={selectedProject}
      onselect={(p: Project) => (selectedProject = p)}
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
