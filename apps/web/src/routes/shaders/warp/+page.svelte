<script lang="ts">
  import { onMount } from 'svelte';
  import {
    ShaderMount,
    warpFragmentShader,
    WarpPatterns,
    getShaderColorFromString,
    getShaderNoiseTexture,
  } from '@paper-design/shaders';
  import type { ShaderMountUniforms } from '@paper-design/shaders';

  let shaderMountDiv = $state<HTMLDivElement | null>(null);

  let colorsWarp = $state(['#121212', '#ffffff', '#121212', '#ffffff']);
  let proportion = $state(0.37);
  let softness = $state(0.24);
  let distortionWarp = $state(0.18);
  let swirlWarp = $state(0.95);
  let swirlIterations = $state(9.4);
  let shape = $state<'checks' | 'stripes' | 'edge'>('checks');
  let shapeScale = $state(0.29);
  let scale = $state(0.85);
  let speedWarp = $state(1.4);

  let noiseTexture: HTMLImageElement | undefined;

  let mount: ShaderMount | undefined;
  let ready = $state(false);

  function buildWarpUniforms(): ShaderMountUniforms {
    return {
      u_colors: colorsWarp.map(c => getShaderColorFromString(c)),
      u_colorsCount: colorsWarp.length,
      u_proportion: proportion,
      u_softness: softness,
      u_shape: WarpPatterns[shape],
      u_shapeScale: shapeScale,
      u_distortion: distortionWarp,
      u_swirl: swirlWarp,
      u_swirlIterations: swirlIterations,
      u_noiseTexture: noiseTexture,
      u_fit: 2,
      u_scale: scale,
      u_rotation: 0,
      u_originX: 0.5,
      u_originY: 0.5,
      u_offsetX: 0,
      u_offsetY: 0,
      u_worldWidth: 0,
      u_worldHeight: 0,
    };
  }

  function updateColorWarp(index: number, value: string) {
    const next = [...colorsWarp];
    next[index] = value;
    colorsWarp = next;
  }

  onMount(() => {
    if (shaderMountDiv) {
      try {
        noiseTexture = getShaderNoiseTexture();
        mount = new ShaderMount(
          shaderMountDiv,
          warpFragmentShader,
          buildWarpUniforms(),
          undefined,
          speedWarp
        );
      } catch {
        /* shader setup failed */
      }
    }

    ready = true;

    return () => {
      try {
        mount?.dispose();
      } catch {
        /* */
      }
      mount = undefined;
    };
  });

  $effect(() => {
    if (!ready || !mount) return;
    mount.setUniforms(buildWarpUniforms());
  });

  $effect(() => {
    if (!ready || !mount) return;
    mount.setSpeed(speedWarp);
  });
</script>

<div class="shaders-section" style="position: relative;">
  <div bind:this={shaderMountDiv} class="shaders-canvas"></div>
  <div class="shader-controls">
    <div class="shader-controls__header">Warp</div>
    {#each colorsWarp as color, i (i)}
      <div class="shader-controls__color">
        <input
          type="color"
          value={color}
          oninput={e =>
            updateColorWarp(i, (e.target as HTMLInputElement).value)}
          class="shader-controls__swatch"
        />
        <span class="shader-controls__hex">{color}</span>
      </div>
    {/each}
    <div class="shader-controls__slider">
      <span class="shader-controls__label">
        Speed <span class="shader-controls__val">{speedWarp.toFixed(2)}</span>
      </span>
      <input
        type="range"
        min="0"
        max="2"
        step="0.01"
        bind:value={speedWarp}
        class="shader-controls__range"
      />
    </div>
    <div class="shader-controls__slider">
      <span class="shader-controls__label">
        Distortion <span class="shader-controls__val"
          >{distortionWarp.toFixed(2)}</span
        >
      </span>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        bind:value={distortionWarp}
        class="shader-controls__range"
      />
    </div>
    <div class="shader-controls__slider">
      <span class="shader-controls__label">
        Swirl <span class="shader-controls__val">{swirlWarp.toFixed(2)}</span>
      </span>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        bind:value={swirlWarp}
        class="shader-controls__range"
      />
    </div>
    <div class="shader-controls__slider">
      <span class="shader-controls__label">
        Swirl Iterations <span class="shader-controls__val"
          >{swirlIterations.toFixed(1)}</span
        >
      </span>
      <input
        type="range"
        min="0"
        max="20"
        step="0.1"
        bind:value={swirlIterations}
        class="shader-controls__range"
      />
    </div>
    <div class="shader-controls__slider">
      <span class="shader-controls__label">
        Proportion <span class="shader-controls__val"
          >{proportion.toFixed(2)}</span
        >
      </span>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        bind:value={proportion}
        class="shader-controls__range"
      />
    </div>
    <div class="shader-controls__slider">
      <span class="shader-controls__label">
        Softness <span class="shader-controls__val">{softness.toFixed(2)}</span>
      </span>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        bind:value={softness}
        class="shader-controls__range"
      />
    </div>
    <div class="shader-controls__slider">
      <span class="shader-controls__label">
        Shape Scale <span class="shader-controls__val"
          >{shapeScale.toFixed(2)}</span
        >
      </span>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        bind:value={shapeScale}
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
    <div class="shader-controls__shape">
      <span class="shader-controls__label">Shape</span>
      <div class="shader-controls__shape-options">
        {#each ['checks', 'stripes', 'edge'] as opt (opt)}
          <button
            class="shader-controls__shape-btn"
            class:shader-controls__shape-btn--active={shape === opt}
            onclick={() => (shape = opt)}>{opt}</button
          >
        {/each}
      </div>
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

  .shaders-canvas {
    display: block;
    height: 100%;
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

  .shader-controls__shape {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .shader-controls__shape-options {
    display: flex;
    gap: 0.25rem;
  }

  .shader-controls__shape-btn {
    background: transparent;
    border: 1px solid var(--color-border-solid, #bfbfbf);
    border-radius: 4px;
    color: var(--color-text-muted, #737373);
    cursor: pointer;
    flex: 1;
    font-family: 'Geist Mono', monospace;
    font-size: 0.55rem;
    letter-spacing: 0.03em;
    padding: 0.2rem 0;
    text-transform: uppercase;
    transition: all 0.15s ease;
  }

  .shader-controls__shape-btn:hover {
    border-color: var(--color-text, #080807);
    color: var(--color-text, #080807);
  }

  .shader-controls__shape-btn--active {
    background: var(--color-text, #080807);
    border-color: var(--color-text, #080807);
    color: var(--color-bg, #f5f5f5);
  }
</style>
