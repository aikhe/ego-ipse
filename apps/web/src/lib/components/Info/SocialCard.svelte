<script lang="ts">
  import * as THREE from 'three';
  import { tick } from 'svelte';
  import gsap from 'gsap';
  import { uiState } from '$lib/state/ui.svelte';
  import {
    vertexShader as smokeVertex,
    fragmentShader as smokeFragment,
  } from '$lib/shaders/preview-reveal/preview-reveal';
  import {
    vertexShader as gridVertex,
    fragmentShader as gridFragment,
  } from '$lib/shaders/preview-reveal-grid/preview-reveal-grid';
  import type { Social } from '$lib/types/social';

  interface Props {
    social?: Social | null;
    visible?: boolean;
  }

  let { social = null, visible = false }: Props = $props();

  let container = $state<HTMLDivElement>();
  let content = $state<HTMLDivElement>();
  let canvas = $state<HTMLCanvasElement>();
  let tl: gsap.core.Timeline | null = null;
  let shaderTween: gsap.core.Tween | null = null;
  let lastName = '';
  let displaySocial = $state<Social | null>(null);

  // WebGL shader state
  let webglRenderer: THREE.WebGLRenderer | null = null;
  let webglScene: THREE.Scene | null = null;
  let webglCamera: THREE.OrthographicCamera | null = null;
  let webglMesh: THREE.Mesh | null = null;
  let webglMaterial: THREE.ShaderMaterial | null = null;
  let webglActive = false;
  let animationFrameId = 0;
  let startTime = 0;

  $effect(() => {
    if (container) {
      if (visible && social) {
        if (social.name !== lastName) {
          displaySocial = social;
          lastName = social.name;
          show();
        }
      } else if (!visible && lastName !== '') {
        lastName = '';
        hide();
      }
    }
  });

  function getCSSColor(name: string): string {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim();
  }

  function syncThemeColors() {
    if (!webglMaterial) return;
    webglMaterial.uniforms.uColor.value.set(getCSSColor('--color-smoke'));
    webglMaterial.uniforms.uBgColor.value.set(getCSSColor('--color-bg-smoke'));
  }

  function renderWebGL() {
    if (webglRenderer && webglScene && webglCamera) {
      webglRenderer.render(webglScene, webglCamera);
    }
  }

  function renderLoop(timestamp: number) {
    if (
      !webglActive ||
      !webglRenderer ||
      !webglScene ||
      !webglCamera ||
      !webglMaterial
    )
      return;

    if (!startTime) startTime = timestamp;
    const elapsed = (timestamp - startTime) / 1000;

    if (webglMaterial.uniforms.uTime) {
      webglMaterial.uniforms.uTime.value = elapsed;
    }
    webglRenderer.render(webglScene, webglCamera);

    animationFrameId = requestAnimationFrame(renderLoop);
  }

  function initWebGL() {
    if (!canvas || webglActive) return;

    const parent = canvas.parentElement;
    if (!parent) return;
    const w = parent.offsetWidth || 200;
    const h = parent.offsetHeight || 150;
    const gridColor = new THREE.Color(getCSSColor('--color-smoke'));
    const bgColor = new THREE.Color(getCSSColor('--color-bg-smoke'));

    webglRenderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      powerPreference: 'high-performance',
    });
    webglRenderer.setPixelRatio(window.devicePixelRatio);
    webglRenderer.setSize(w, h, false);

    webglScene = new THREE.Scene();
    webglCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10);
    webglCamera.position.z = 1;

    const isGrid = uiState.sfxEffect === 'GRID';
    const [vShader, fShader] = isGrid
      ? [gridVertex, gridFragment]
      : [smokeVertex, smokeFragment];

    const uniforms: Record<string, THREE.Uniform> = {
      uContainerRes: new THREE.Uniform(new THREE.Vector2(w, h)),
      uProgress: new THREE.Uniform(0),
      uColor: new THREE.Uniform(gridColor),
      uBgColor: new THREE.Uniform(bgColor),
    };

    if (isGrid) {
      uniforms.uGridSize = new THREE.Uniform(8);
    } else {
      uniforms.uTime = new THREE.Uniform(0);
      uniforms.uSeed = new THREE.Uniform(
        new THREE.Vector2(Math.random() * 1000, Math.random() * 1000)
      );
    }

    webglMaterial = new THREE.ShaderMaterial({
      vertexShader: vShader,
      fragmentShader: fShader,
      uniforms,
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    webglMesh = new THREE.Mesh(geometry, webglMaterial);
    webglScene.add(webglMesh);

    webglActive = true;
    startTime = performance.now();
    renderLoop(startTime);
  }

  function destroyWebGL() {
    if (webglMesh) {
      webglMesh.geometry.dispose();
      webglScene?.remove(webglMesh);
      webglMesh = null;
    }
    if (webglMaterial) {
      webglMaterial.dispose();
      webglMaterial = null;
    }
    if (webglRenderer) {
      webglRenderer.dispose();
      webglRenderer = null;
    }
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = 0;
    }
    startTime = 0;
    webglScene = null;
    webglCamera = null;
    webglActive = false;
  }

  async function show() {
    await tick();
    if (!container) return;

    if (tl) tl.kill();
    tl = gsap.timeline();

    tl.set(container!, {
      transformOrigin: 'bottom left',
      scaleY: 0,
      y: 10,
    });

    tl.to(container!, {
      opacity: 1,
      scaleY: 1,
      y: 0,
      duration: 0.5,
      ease: 'expo.out',
    });

    // hologram flicker
    tl.to(
      container!,
      {
        duration: 0.05,
        repeat: 3,
        yoyo: true,
        ease: 'none',
      },
      '<0.1'
    );

    if (content) {
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

    // webgl shader reveal
    if (canvas && displaySocial?.image) {
      if (shaderTween) shaderTween.kill();
      if (webglActive) destroyWebGL();
      initWebGL();

      if (webglMaterial) {
        shaderTween = gsap.to(webglMaterial.uniforms.uProgress, {
          value: 1,
          duration: uiState.sfxEffect === 'GRID' ? 1.4 : 2.2,
          ease: 'cubic-bezier(0.66, 0, 0.34, 1)',
          onUpdate: renderWebGL,
        });
      }
    }
  }

  function hide() {
    if (!container) return;
    if (tl) tl.kill();
    tl = gsap.timeline();

    if (content) {
      tl.to(content.children, {
        opacity: 0,
        y: -5,
        duration: 0.2,
        stagger: 0.03,
        ease: 'power2.in',
      });
    }

    // collapse container
    tl.to(
      container!,
      {
        scaleY: 0,
        y: 10,
        duration: 0.3,
        ease: 'expo.in',
      },
      '-=0.1'
    );
  }

  // observe data-theme attribute changes and sync colors into the live shader
  $effect(() => {
    const observer = new MutationObserver(() => syncThemeColors());
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => observer.disconnect();
  });

  // swap shader live when effect type changes
  $effect(() => {
    if (webglActive && uiState.sfxEffect) {
      if (shaderTween) shaderTween.kill();
      const prevProgress = webglMaterial?.uniforms.uProgress.value ?? 0;
      destroyWebGL();
      initWebGL();
      if (webglMaterial) {
        webglMaterial.uniforms.uProgress.value = 0;
        gsap.to(webglMaterial.uniforms.uProgress, {
          value: prevProgress,
          duration: uiState.sfxEffect === 'GRID' ? 0.15 : 0.4,
          ease: 'power2.out',
          onUpdate: renderWebGL,
        });
      }
    }
  });

  // cleanup webgl on component destroy
  $effect(() => {
    return () => {
      destroyWebGL();
    };
  });
</script>

<div class="social-card" bind:this={container}>
  <div class="social-card__accents"></div>
  {#if displaySocial}
    <div class="social-card__inner" bind:this={content}>
      <div class="social-card__side social-card__side--left">
        <div class="social-card__user">
          <p class="social-card__handle">
            {displaySocial.handle || '@aikheandrei'}
          </p>
          <p class="social-card__bio">
            &gt; {displaySocial.bioPrefix || 'BIO'}
            <strong class="social-card__bio--strong"
              >{displaySocial.bioHighlight || '→ CREATIVE DEV'}</strong
            >
          </p>
        </div>
        <div class="social-card__stats">
          {#if displaySocial.stats}
            {#each displaySocial.stats as stat (stat.label)}
              <div class="social-card__stat">
                <span class="social-card__stat-label">{stat.label}:</span>
                <span class="social-card__stat-val">[{stat.value}]</span>
              </div>
            {/each}
          {:else}
            <div class="social-card__stat">
              <span class="social-card__stat-label">FOLLOWING:</span>
              <span class="social-card__stat-val">[939]</span>
            </div>
            <div class="social-card__stat">
              <span class="social-card__stat-label">FOLLOWERS:</span>
              <span class="social-card__stat-val">[4,426]</span>
            </div>
            <div class="social-card__stat">
              <span class="social-card__stat-label">LEVEL:</span>
              <span class="social-card__stat-val">[99]</span>
            </div>
            <div class="social-card__stat">
              <span class="social-card__stat-label">RANK:</span>
              <span class="social-card__stat-val">[S]</span>
            </div>
          {/if}
        </div>
        <div class="social-card__bottom">
          <div class="social-card__tags">
            {#if displaySocial.tags}
              {#each displaySocial.tags as tag (tag)}
                <span class="social-card__tag font--mono-tag-regular"
                  >[ {tag} ]</span
                >
              {/each}
            {:else}
              <span class="social-card__tag font--mono-tag-regular"
                >[ {displaySocial.name} ]</span
              >
              <span class="social-card__tag font--mono-tag-regular"
                >[ {displaySocial.external ? 'SOCIAL' : 'INTERNAL'} ]</span
              >
            {/if}
          </div>
          <button class="social-card__status">
            {displaySocial.status || 'ACTIVE...'}
          </button>
        </div>
      </div>
      <div class="social-card__side social-card__side--right">
        <div class="social-card__preview">
          <img
            src={displaySocial.image}
            alt="Preview"
            class="social-card__img"
          />
          <div class="social-card__dot social-card__dot--tl"></div>
          <div class="social-card__dot social-card__dot--tr"></div>
          <div class="social-card__dot social-card__dot--bl"></div>
          <div class="social-card__dot social-card__dot--br"></div>
          <canvas bind:this={canvas} class="social-card__canvas"></canvas>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .social-card {
    backdrop-filter: blur(4px);
    background: var(--color-bg);
    border: 1px solid var(--color-border-solid);
    bottom: calc(100% - 1rem);
    height: 14.5rem;
    opacity: 0;
    pointer-events: none;
    position: absolute;
    right: 0;
    transform-origin: bottom left;
    width: calc(50% - 0.6rem); /* 3 grid columns */
    z-index: 999;
  }

  .social-card__accents {
    inset: -1px;
    pointer-events: none;
    position: absolute;
    z-index: 5;
  }

  .social-card__accents::before {
    background:
      linear-gradient(to right, var(--color-border-corner) 1px, transparent 1px)
        0 0,
      linear-gradient(
          to bottom,
          var(--color-border-corner) 1px,
          transparent 1px
        )
        0 0,
      linear-gradient(to left, var(--color-border-corner) 1px, transparent 1px)
        100% 0,
      linear-gradient(
          to bottom,
          var(--color-border-corner) 1px,
          transparent 1px
        )
        100% 0,
      linear-gradient(to right, var(--color-border-corner) 1px, transparent 1px)
        0 100%,
      linear-gradient(to top, var(--color-border-corner) 1px, transparent 1px) 0
        100%,
      linear-gradient(to left, var(--color-border-corner) 1px, transparent 1px)
        100% 100%,
      linear-gradient(to top, var(--color-border-corner) 1px, transparent 1px)
        100% 100%;
    background-repeat: no-repeat;
    background-size: 10px 10px;
    content: '';
    inset: 0;
    position: absolute;
  }

  .social-card__inner {
    box-sizing: border-box;
    display: grid;
    gap: 1rem;
    grid-template-columns: 1fr 1fr;
    height: 100%;
    padding: 0.8rem;
  }

  .social-card__side--left {
    display: flex;
    flex-direction: column;
    font-family: 'Geist Mono', monospace;
    justify-content: space-between;
  }

  .social-card__user {
    display: flex;
    flex-direction: column;
    row-gap: 0.24rem;
  }

  .social-card__handle {
    color: var(--color-text);
    font-family: 'Geist Mono', monospace;
    font-size: 0.8rem;
    font-weight: 400;
    letter-spacing: 0.034em;
    margin: 0;
  }

  .social-card__bio {
    color: var(--color-overlay-60);
    font-family: 'Geist Mono', monospace;
    font-size: 0.8rem;
    font-weight: 400;
    letter-spacing: 0.034em;
    margin: 0.1rem 0 0;
    text-wrap: nowrap;
  }

  .social-card__bio--strong {
    color: var(--color-text);
    font-weight: 400;
  }

  .social-card__stats {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    margin: 0.4rem 0;
  }

  .social-card__stat {
    display: flex;
    font-family: 'Geist Mono', monospace;
    font-size: 0.8rem;
    font-weight: 400;
    gap: 1.86rem;
    justify-content: flex-start;
    letter-spacing: 0.034em;
    line-height: 1.2;
  }

  .social-card__stat-label {
    color: var(--color-overlay-60);
    flex-shrink: 0;
    width: 85px;
  }

  .social-card__stat-val {
    color: var(--color-text);
    flex-grow: 1;
  }

  .social-card__bottom {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    margin-top: auto;
  }

  .social-card__tags {
    display: flex;
    gap: 0.4rem;
  }

  .social-card__tag {
    color: var(--color-text);
    white-space: nowrap;
  }

  .social-card__status {
    background: var(--color-overlay-02);
    border: 1px solid var(--color-border-solid);
    color: var(--color-overlay-60);
    cursor: default;
    font-family: 'Geist Mono', monospace;
    font-size: 0.8rem;
    font-weight: 400;
    letter-spacing: 0.034em;
    padding: 0.24rem;
    text-align: center;
    transition: background 0.2s ease;
    width: 100%;
  }

  .social-card__side--right {
    align-items: center;
    display: flex;
    justify-content: center;
  }

  .social-card__preview {
    align-items: center;
    background: var(--color-bg);
    border: 1px dashed var(--color-overlay-60);
    display: flex;
    height: 12.5rem;
    justify-content: center;
    overflow: visible;
    position: relative;
    width: 12.5rem;
  }

  .social-card__img {
    display: block;
    max-height: 100%;
    max-width: 100%;
    object-fit: contain;
  }

  .social-card__dot {
    background: var(--color-text);
    height: 4px;
    position: absolute;
    width: 4px;
    z-index: 100;
  }

  .social-card__dot--tl {
    left: -1px;
    top: -1px;
  }

  .social-card__dot--tr {
    right: -1px;
    top: -1px;
  }

  .social-card__dot--bl {
    bottom: -1px;
    left: -1px;
  }

  .social-card__dot--br {
    bottom: -1px;
    right: -1px;
  }

  .social-card__canvas {
    height: 100%;
    inset: 0;
    pointer-events: none;
    position: absolute;
    width: 100%;
  }
</style>
