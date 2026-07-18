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

  interface Props {
    project?: {
      name: string;
      section: string;
      date: string;
      tags: readonly string[];
      id: string;
      image?: string;
    } | null;
    visible?: boolean;
    posX?: number;
    posY?: number;
    width?: number;
    height?: number;
  }

  let {
    project = null,
    visible = false,
    posX = 0,
    posY = 0,
    width = 260,
    height = 380,
  }: Props = $props();

  let container = $state<HTMLDivElement>();
  let content = $state<HTMLDivElement>();
  let canvas = $state<HTMLCanvasElement>();
  let tl: gsap.core.Timeline | null = null;
  let shaderTween: gsap.core.Tween | null = null;
  let lastProjectName = $state('');

  // Three.js state
  let webglRenderer: THREE.WebGLRenderer | null = null;
  let webglScene: THREE.Scene | null = null;
  let webglCamera: THREE.OrthographicCamera | null = null;
  let webglMesh: THREE.Mesh | null = null;
  let webglMaterial: THREE.ShaderMaterial | null = null;
  let webglActive = false;
  let animationFrameId = 0;
  let startTime = 0;

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

  $effect(() => {
    if (container) {
      const shouldShow = visible && project;
      if (shouldShow && project) {
        if (project.name !== lastProjectName) {
          lastProjectName = project.name;
          show();
        }
      } else {
        lastProjectName = '';
        hide();
      }
    }
  });

  // observe data-theme attribute changes and sync colors into the live shader
  $effect(() => {
    const observer = new MutationObserver(() => syncThemeColors());
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => observer.disconnect();
  });

  $effect(() => {
    if (container && (posX || posY)) {
      gsap.to(container, {
        left: posX,
        top: posY,
        duration: 0.4,
        ease: 'power3.out',
      });
    }
  });

  // swap shader live when effect type changes
  $effect(() => {
    if (uiState.sfxEffect === 'NONE') {
      if (webglActive) destroyWebGL();
      return;
    }
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

  function getCSSColor(name: string): string {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim();
  }

  // push fresh CSS custom property colors into the live shader uniforms
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

  function initWebGL() {
    if (!canvas || webglActive) return;

    const parent = canvas.parentElement;
    if (!parent) return;
    const w = parent.offsetWidth || 200;
    const h = parent.offsetHeight || 150;
    const gridColor = new THREE.Color(getCSSColor('--color-smoke'));
    const bgColor = new THREE.Color(getCSSColor('--color-bg-smoke'));

    // alpha: true — canvas is a transparent overlay on top of the native <img>
    webglRenderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      powerPreference: 'high-performance',
    });
    webglRenderer.setPixelRatio(window.devicePixelRatio);
    // false = don't set inline canvas CSS styles; let inset:0/width:100% handle layout
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
      uniforms.uGridSize = new THREE.Uniform(3);
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

  // resets the shader state without destroying the renderer — used on project switch
  async function show() {
    await tick();
    if (!container) return;

    if (tl) tl.kill();
    tl = gsap.timeline();

    tl.set(container, {
      xPercent: -50,
      yPercent: -100,
      transformOrigin: 'bottom center',
      scaleY: 0,
      y: 0,
    });

    tl.to(container, {
      opacity: 1,
      scaleY: 1,
      y: -12,
      duration: 0.5,
      ease: 'expo.out',
    });

    // hologram flicker
    tl.to(
      container,
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
        { opacity: 0, y: 4 },
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

    // webgl shader reveal — canvas is an alpha mask over the native img
    if (project?.image && uiState.sfxEffect !== 'NONE') {
      if (shaderTween) shaderTween.kill();
      if (webglActive) destroyWebGL();
      initWebGL();

      if (webglMaterial) {
        shaderTween = gsap.to(webglMaterial.uniforms.uProgress, {
          value: 1,
          delay: uiState.sfxEffect === 'GRID' ? 0.4 : 0.3,
          duration: uiState.sfxEffect === 'GRID' ? 1.4 : 2.4,
          ease: 'cubic-bezier(0.66, 0, 0.34, 1)',
          onUpdate: renderWebGL,
        });
      }
    }
  }

  function hide() {
    if (tl) tl.kill();
    tl = gsap.timeline();

    // fade out content
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
        opacity: 0,
        scaleY: 0,
        y: 0,
        duration: 0.3,
        ease: 'expo.in',
      },
      '-=0.1'
    );
  }

  // cleanup webgl on component destroy
  $effect(() => {
    return () => {
      destroyWebGL();
    };
  });
</script>

<div
  class="preview-container"
  bind:this={container}
  style:width="{width}px"
  style:height="{height}px"
>
  <div class="corner-accents"></div>
  {#if project}
    <div class="preview-card" bind:this={content}>
      <div class="header font--mono-meta">
        <h3 class="name">{project.name.toUpperCase()} ...</h3>
        <div class="meta">
          <span class="symbol">&gt;</span>
          <span class="section">{project.section}</span>
          <span class="separator">→</span>
          <span class="date">{project.date}</span>
        </div>
      </div>

      <div class="content-area">
        <div class="preview-inner">
          <div class="image-box">
            <img
              crossorigin="anonymous"
              src={project.image}
              alt={project.name}
              class="project-image"
            />
            <canvas bind:this={canvas} class="tile-canvas"></canvas>
          </div>

          <div class="text-footer font--mono-footer">
            <div class="tags">
              {#each project.tags as tag, i (i + tag)}
                <span class="tag font--mono-tag-strong">[ {tag} ]</span>
              {/each}
            </div>
            <div class="id">{project.id}</div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .preview-container {
    backdrop-filter: blur(4px);
    background: var(--color-bg);
    border: 1px solid var(--color-border-solid);
    opacity: 0;
    padding: 0;
    pointer-events: none;
    position: absolute;
    z-index: 200;
  }

  .corner-accents {
    inset: -1px;
    pointer-events: none;
    position: absolute;
    z-index: 5;
  }

  .corner-accents::before {
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

  .preview-card {
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;
    z-index: 1;
  }

  .header {
    background: var(--color-overlay-02);
    border-bottom: 1px solid var(--color-border-solid);
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    gap: 0.24rem;
    padding: 0.5rem 0.7rem;
    position: relative;
  }

  .header::before,
  .header::after {
    bottom: -10px;
    content: '';
    height: 20px;
    pointer-events: none;
    position: absolute;
    width: 10px;
    z-index: 10;
  }

  .header::before {
    background:
      linear-gradient(to right, var(--color-border-corner) 1px, transparent 1px)
        0 0,
      linear-gradient(
          to bottom,
          var(--color-border-corner) 1px,
          transparent 1px
        )
        0 50%;
    background-repeat: no-repeat;
    background-size:
      1px 100%,
      100% 1px;
    left: -1px;
  }

  .header::after {
    background:
      linear-gradient(to left, var(--color-border-corner) 1px, transparent 1px)
        100% 0,
      linear-gradient(
          to bottom,
          var(--color-border-corner) 1px,
          transparent 1px
        )
        100% 50%;
    background-repeat: no-repeat;
    background-size:
      1px 100%,
      100% 1px;
    right: -1px;
  }

  .name {
    color: var(--color-text);
  }

  .meta {
    align-items: center;
    color: var(--color-overlay-60);
    display: flex;
    gap: 0.6rem;
  }

  .content-area {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    min-height: 0;
    padding: 0.6rem 0.6rem 0.72rem;
  }

  .preview-inner {
    background: var(--color-bg);
    border: 1px solid var(--color-border-solid);
    display: flex;
    flex: 1;
    flex-direction: column;
    overflow: hidden;
  }

  .image-box {
    align-items: center;
    display: flex;
    flex: 1;
    justify-content: center;
    min-height: 0;
    position: relative;
    width: 100%;
  }

  .project-image {
    display: block;
    height: 100%;
    width: 100%;
    object-fit: contain;
  }

  .tile-canvas {
    height: 100%;
    inset: 0;
    pointer-events: none;
    position: absolute;
    width: 100%;
  }

  .text-footer {
    align-items: center;
    background: var(--color-bg);
    border-top: 1px solid var(--color-border-solid);
    color: var(--color-overlay-60);
    display: flex;
    flex-shrink: 0;
    justify-content: space-between;
    padding: 0.4rem 0.6rem;
  }

  .tags {
    display: flex;
    gap: 0.5rem;
  }

  .id {
    opacity: 0.8;
  }
</style>
