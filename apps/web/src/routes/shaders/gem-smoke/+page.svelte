<script lang="ts">
  import { onMount } from 'svelte';
  import {
    ShaderMount,
    getShaderColorFromString,
    gemSmokeFragmentShader,
    GemSmokeShapes,
    toProcessedGemSmoke,
  } from '@paper-design/shaders';
  import type { ShaderMountUniforms } from '@paper-design/shaders';
  import logoSvg from '$lib/assets/logo.svg';

  let canvasCDiv = $state<HTMLDivElement | null>(null);

  let colorsGem = $state(['#454545', '#141414', '#2e2e2e', '#000000']);
  let colorBack = $state('#ffffff');
  let colorInner = $state('#ffffff');
  let shapeGem = $state<'none' | 'circle' | 'daisy' | 'diamond' | 'metaballs'>(
    'circle'
  );
  let innerDistortion = $state(1);
  let outerDistortion = $state(1);
  let outerGlow = $state(0.26);
  let innerGlow = $state(1);
  let offset = $state(0);
  let angle = $state(0);
  let size = $state(0.72);
  let speedGem = $state(0.8);
  let scaleGem = $state(0.16);

  let mountGem: ShaderMount | undefined;
  let gemImage: HTMLImageElement | undefined;
  let readyGem = $state(false);

  function updateColorGem(index: number, value: string) {
    const next = [...colorsGem];
    next[index] = value;
    colorsGem = next;
  }

  function buildGemUniforms(): ShaderMountUniforms {
    return {
      u_colorBack: getShaderColorFromString(colorBack),
      u_colors: colorsGem.map(c => getShaderColorFromString(c)),
      u_colorsCount: colorsGem.length,
      u_image: gemImage,
      u_innerDistortion: innerDistortion,
      u_outerDistortion: outerDistortion,
      u_outerGlow: outerGlow,
      u_innerGlow: innerGlow,
      u_colorInner: getShaderColorFromString(colorInner),
      u_offset: offset,
      u_angle: angle,
      u_size: size,
      u_shape: GemSmokeShapes[shapeGem],
      u_isImage: true,
      u_fit: 2,
      u_scale: scaleGem,
      u_rotation: 0,
      u_originX: 0.5,
      u_originY: 0.5,
      u_offsetX: 0,
      u_offsetY: 0,
      u_worldWidth: 1280,
      u_worldHeight: 720,
    };
  }

  onMount(() => {
    let imageUrl: string | undefined;
    if (canvasCDiv) {
      (async () => {
        try {
          const processed = await toProcessedGemSmoke(logoSvg);
          imageUrl = URL.createObjectURL(processed.pngBlob);
          const img = new Image();
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () =>
              reject(new Error('Failed to load processed image'));
            img.src = imageUrl;
          });
          gemImage = img;
          mountGem = new ShaderMount(
            canvasCDiv,
            gemSmokeFragmentShader,
            buildGemUniforms(),
            undefined,
            speedGem,
            undefined,
            1
          );
          readyGem = true;
        } catch {
          /* gem smoke setup failed */
        }
      })();
    }

    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
      try {
        mountGem?.dispose();
      } catch {
        /* */
      }
      mountGem = undefined;
    };
  });

  $effect(() => {
    if (!readyGem || !mountGem) return;
    mountGem.setUniforms(buildGemUniforms());
  });

  $effect(() => {
    if (!readyGem || !mountGem) return;
    mountGem.setSpeed(speedGem);
  });
</script>

<div class="shaders-section" style="position: relative;">
  <div bind:this={canvasCDiv} class="shaders-canvas"></div>
  <div class="shader-controls">
    <div class="shader-controls__header">Gem Smoke</div>
    {#each colorsGem as color, i (i)}
      <div class="shader-controls__color">
        <input
          type="color"
          value={color}
          oninput={e => updateColorGem(i, (e.target as HTMLInputElement).value)}
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
        Speed <span class="shader-controls__val">{speedGem.toFixed(2)}</span>
      </span>
      <input
        type="range"
        min="0"
        max="2"
        step="0.01"
        bind:value={speedGem}
        class="shader-controls__range"
      />
    </div>
    <div class="shader-controls__slider">
      <span class="shader-controls__label">
        Scale <span class="shader-controls__val">{scaleGem.toFixed(2)}</span>
      </span>
      <input
        type="range"
        min="0.01"
        max="4"
        step="0.01"
        bind:value={scaleGem}
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
</style>
