<script lang="ts">
  import Projects from '$lib/components/Info/Projects.svelte';
  import Socials from '$lib/components/Info/Socials.svelte';
</script>

<div style="display: contents">
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

  <div class="info pointer-events-auto">
    <p class="info__title">CREATIVE PROJECTS I’VE WORKED ON</p>
    <Projects />
    <Socials />
  </div>
</div>

<style>
  .hero {
    grid-column: 1 / span 10;
    grid-row: 1;
    display: flex;
    flex-direction: column;
    gap: 2.4rem;
  }

  .hero__title {
    font-family: 'GeistPixel Square', sans-serif;
    font-size: 2rem;
    line-height: 34px;
    letter-spacing: 0.34%;
    width: 38ch;
  }

  .title--strong {
    font-family: 'Advine-Pixel', sans-serif;
    font-size: 4rem;
    letter-spacing: 4%;
  }

  .hero__description {
    font-family: 'Geist Mono', monospace;
    font-weight: 500;
    letter-spacing: 0.34%;
    font-size: 0.875rem;
    line-height: 16px;
    width: 48ch;
    color: var(--color-text-muted);
  }

  .description--strong {
    font-weight: 500;
    color: var(--color-text);
  }

  .info {
    grid-column: 7 / span 6;
    grid-row: 1;
    display: flex;
    flex-direction: column;
    gap: 0.88rem;
    position: relative;
  }

  .info__title {
    font-family: 'Geist Mono', monospace;
    font-weight: 500;
    letter-spacing: 0.34%;
    font-size: 0.875rem;
    color: var(--color-text-muted);

    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
</style>
