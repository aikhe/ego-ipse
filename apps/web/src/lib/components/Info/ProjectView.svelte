<script lang="ts">
  interface Props {
    project: {
      name: string;
      section: string;
      date: string;
      tags: readonly string[];
      id: string;
      image?: string;
    } | null;
  }

  let { project }: Props = $props();
</script>

<div class="project-view">
  <div class="corner-accents"></div>
  {#if project}
    <div class="project-content">
      <!-- Content will be added here later -->
      <!-- <div class="placeholder"> -->
      <!--   <h2>{project.name}</h2> -->
      <!--   <p>{project.section}</p> -->
      <!-- </div> -->
    </div>
  {/if}
</div>

<style>
  .project-view {
    background: var(--color-bg);
    border-left: 1px dashed #3a3a3a;
    border-right: 1px dashed #3a3a3a;
    display: flex;
    flex-direction: column;
    grid-column: 1 / span 6;
    grid-row: 1;
    height: 100vh;
    left: 0;
    padding: 2.4rem;
    position: absolute;
    top: calc(-4.8rem); /* offset header height */
    width: 100%;
    z-index: 100;
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
    inset: 0px -1px;
    position: absolute;
  }

  .project-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
  }

  .placeholder {
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
  }
</style>
