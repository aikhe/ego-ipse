<script lang="ts">
</script>

<div class="shaders-index">
  <h1 class="shaders-index__title">Shaders</h1>
  <div class="shaders-index__grid">
    <a href="/shaders/a" class="shaders-index__card">
      <span class="shaders-index__card-label">Canvas A</span>
      <span class="shaders-index__card-desc">Gem Smoke (Threlte)</span>
    </a>
    <a href="/shaders/warp" class="shaders-index__card">
      <span class="shaders-index__card-label">Warp</span>
      <span class="shaders-index__card-desc"
        >Animated color fields with noise &amp; swirl</span
      >
    </a>
    <a href="/shaders/gem-smoke" class="shaders-index__card">
      <span class="shaders-index__card-label">Gem Smoke</span>
      <span class="shaders-index__card-desc"
        >Glowing colors around a logo shape</span
      >
    </a>
  </div>
</div>

<style>
  .shaders-index {
    align-items: center;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    justify-content: center;
    min-height: calc(100dvh - 4.8rem);
    padding: 2rem;
  }

  .shaders-index__title {
    font-family: 'Geist Mono', monospace;
    font-size: 1.5rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .shaders-index__grid {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
    max-width: 600px;
  }

  .shaders-index__card {
    background: color-mix(in srgb, var(--color-bg, #f5f5f5) 85%, transparent);
    border: 1px solid var(--color-border-solid, #bfbfbf);
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    padding: 1rem 1.25rem;
    text-decoration: none;
    transition: border-color 0.15s ease;
    width: 200px;
  }

  .shaders-index__card:hover {
    border-color: var(--color-text, #080807);
  }

  .shaders-index__card-label {
    color: var(--color-text, #080807);
    font-family: 'Geist Mono', monospace;
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }

  .shaders-index__card-desc {
    color: var(--color-text-muted, #737373);
    font-family: 'Geist Mono', monospace;
    font-size: 0.65rem;
    line-height: 1.3;
  }
</style>
