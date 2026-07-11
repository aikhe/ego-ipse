<script lang="ts">
  import { Canvas } from '@threlte/core';
  import GemSmokeBg from '$lib/shaders/gem-smoke/GemSmokeBg.svelte';
  import { getShaderColorFromString } from '$lib/shaders/gem-smoke/gem-smoke.ts';
  import type { GemSmokeShape } from '$lib/shaders/gem-smoke/gem-smoke.ts';

  let colors = $state<string[]>(['#454545', '#141414', '#2e2e2e', '#000000']);
  let colorBack = $state('#ffffff');
  let colorInner = $state('#ffffff');
  let shape = $state<GemSmokeShape>('circle');
  let innerDistortion = $state(1);
  let outerDistortion = $state(1);
  let outerGlow = $state(0.26);
  let innerGlow = $state(1);
  let offset = $state(0);
  let angle = $state(0);
  let size = $state(0.72);
  let speed = $state(0.8);
  let scale = $state(0.14);

  function updateColor(index: number, value: string) {
    const next = [...colors];
    next[index] = value;
    colors = next;
  }
</script>

<div class="shaders-section" style="position: relative;">
  <Canvas>
    <GemSmokeBg
      colors={colors.map(c => getShaderColorFromString(c))}
      colorBack={getShaderColorFromString(colorBack)}
      colorInner={getShaderColorFromString(colorInner)}
      {shape}
      {innerDistortion}
      {outerDistortion}
      {outerGlow}
      {innerGlow}
      offsetV={offset}
      {angle}
      {size}
      {speed}
      {scale}
    />
  </Canvas>
  <div class="shader-controls">
    <div class="shader-controls__header">Gem Smoke (Threlte)</div>
    {#each colors as color, i (i)}
      <div class="shader-controls__color">
        <input
          type="color"
          value={color}
          oninput={e => updateColor(i, (e.target as HTMLInputElement).value)}
          class="shader-controls__swatch"
        />
        <span class="shader-controls__hex">{color}</span>
      </div>
    {/each}
    <div class="shader-controls__color">
      <span class="shader-controls__label">Back</span>
      <input
        type="color"
        value={colorBack}
        oninput={e => (colorBack = (e.target as HTMLInputElement).value)}
        class="shader-controls__swatch"
      />
      <span class="shader-controls__hex">{colorBack}</span>
    </div>
    <div class="shader-controls__color">
      <span class="shader-controls__label">Inner</span>
      <input
        type="color"
        value={colorInner}
        oninput={e => (colorInner = (e.target as HTMLInputElement).value)}
        class="shader-controls__swatch"
      />
      <span class="shader-controls__hex">{colorInner}</span>
    </div>
    <div class="shader-controls__slider">
      <span class="shader-controls__label">
        Speed <span class="shader-controls__val">{speed.toFixed(2)}</span>
      </span>
      <input
        type="range"
        min="0"
        max="2"
        step="0.01"
        bind:value={speed}
        class="shader-controls__range"
      />
    </div>
    <div class="shader-controls__slider">
      <span class="shader-controls__label">
        Scale <span class="shader-controls__val">{scale.toFixed(2)}</span>
      </span>
      <input
        type="range"
        min="0.01"
        max="4"
        step="0.01"
        bind:value={scale}
        class="shader-controls__range"
      />
    </div>
    <div class="shader-controls__slider">
      <span class="shader-controls__label">
        Inner Dist <span class="shader-controls__val"
          >{innerDistortion.toFixed(2)}</span
        >
      </span>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        bind:value={innerDistortion}
        class="shader-controls__range"
      />
    </div>
    <div class="shader-controls__slider">
      <span class="shader-controls__label">
        Outer Dist <span class="shader-controls__val"
          >{outerDistortion.toFixed(2)}</span
        >
      </span>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        bind:value={outerDistortion}
        class="shader-controls__range"
      />
    </div>
    <div class="shader-controls__slider">
      <span class="shader-controls__label">
        Outer Glow <span class="shader-controls__val"
          >{outerGlow.toFixed(2)}</span
        >
      </span>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        bind:value={outerGlow}
        class="shader-controls__range"
      />
    </div>
    <div class="shader-controls__slider">
      <span class="shader-controls__label">
        Inner Glow <span class="shader-controls__val"
          >{innerGlow.toFixed(2)}</span
        >
      </span>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        bind:value={innerGlow}
        class="shader-controls__range"
      />
    </div>
    <div class="shader-controls__slider">
      <span class="shader-controls__label">
        Offset <span class="shader-controls__val">{offset.toFixed(2)}</span>
      </span>
      <input
        type="range"
        min="-1"
        max="1"
        step="0.01"
        bind:value={offset}
        class="shader-controls__range"
      />
    </div>
    <div class="shader-controls__slider">
      <span class="shader-controls__label">
        Angle <span class="shader-controls__val">{angle.toFixed(0)}</span>
      </span>
      <input
        type="range"
        min="0"
        max="360"
        step="1"
        bind:value={angle}
        class="shader-controls__range"
      />
    </div>
    <div class="shader-controls__slider">
      <span class="shader-controls__label">
        Size <span class="shader-controls__val">{size.toFixed(2)}</span>
      </span>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        bind:value={size}
        class="shader-controls__range"
      />
    </div>
  </div>
</div>

<style>
  :global(.app-viewport) {
    overflow-y: auto !important;
  }

  :global(.app-stage) {
    height: auto !important;
    overflow: visible !important;
    transform: none !important;
    width: 100% !important;
  }

  :global(.header) {
    left: 0 !important;
    position: fixed !important;
    right: 0 !important;
    top: 0 !important;
    z-index: 50 !important;
  }

  .shaders-section {
    height: 100dvh;
    position: relative;
    width: 100%;
  }

  .shader-controls {
    backdrop-filter: blur(16px);
    background: color-mix(in srgb, var(--color-bg, #f5f5f5) 85%, transparent);
    border: 1px solid var(--color-border-solid, #bfbfbf);
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    font-family: 'Geist Mono', monospace;
    font-size: 0.65rem;
    gap: 0.6rem;
    padding: 0.6rem 0.75rem;
    position: absolute;
    right: 1rem;
    top: 4rem;
    width: 140px;
    z-index: 5;
  }

  .shader-controls__color {
    align-items: center;
    display: flex;
    gap: 0.3rem;
  }

  .shader-controls__swatch {
    appearance: none;
    background: none;
    border: 1px solid var(--color-border-solid, #bfbfbf);
    border-radius: 3px;
    cursor: pointer;
    height: 1.1rem;
    padding: 0;
    width: 1.1rem;
  }

  .shader-controls__swatch::-webkit-color-swatch-wrapper {
    padding: 1px;
  }

  .shader-controls__swatch::-webkit-color-swatch {
    border: none;
    border-radius: 1px;
  }

  .shader-controls__hex {
    color: var(--color-text, #080807);
    font-size: 0.6rem;
  }

  .shader-controls__slider {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .shader-controls__label {
    color: var(--color-text-muted, #737373);
    display: flex;
    justify-content: space-between;
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }

  .shader-controls__val {
    color: var(--color-text, #080807);
  }

  .shader-controls__range {
    accent-color: var(--color-text, #080807);
    cursor: pointer;
    height: 0.7rem;
    width: 100%;
  }

  .shader-controls__header {
    border-bottom: 1px solid var(--color-border-solid, #bfbfbf);
    font-family: 'Geist Mono', monospace;
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    padding-bottom: 0.4rem;
    text-transform: uppercase;
  }
</style>
