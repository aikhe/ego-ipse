<script lang="ts">
  import { onMount } from 'svelte';
  import { T, useThrelte, useTask } from '@threlte/core';
  import * as THREE from 'three';
  import {
    gemSmokeVertexShader,
    gemSmokeFragmentShader,
    createFullScreenQuadGeometry,
    getShaderColorFromString,
    GemSmokeShapes,
    type Vec4,
    type GemSmokeShape,
  } from './gem-smoke.js';
  import { toProcessedGemSmoke } from '@paper-design/shaders';
  import logoSvg from '$lib/assets/logo.svg';

  let {
    colors = ['#454545', '#141414', '#2e2e2e', '#000000'].map(
      getShaderColorFromString
    ),
    colorBack = getShaderColorFromString('#ffffff'),
    colorInner = getShaderColorFromString('#ffffff'),
    shape = 'circle' as GemSmokeShape,
    innerDistortion = 1,
    outerDistortion = 1,
    outerGlow = 0.26,
    innerGlow = 1,
    offsetV = 0,
    angle = 0,
    size = 0.72,
    speed = 0.8,
    scale = 0.16,
  }: {
    colors?: Vec4[];
    colorBack?: Vec4;
    colorInner?: Vec4;
    shape?: GemSmokeShape;
    innerDistortion?: number;
    outerDistortion?: number;
    outerGlow?: number;
    innerGlow?: number;
    offsetV?: number;
    angle?: number;
    size?: number;
    speed?: number;
    scale?: number;
  } = $props();

  function padColorsTo6(colors: Vec4[]): Float32Array {
    const arr = new Float32Array(24);
    for (let i = 0; i < 6; i++) {
      const off = i * 4;
      if (i < colors.length) {
        const c = colors[i];
        arr[off] = c[0];
        arr[off + 1] = c[1];
        arr[off + 2] = c[2];
        arr[off + 3] = c[3];
      } else {
        arr[off] = 0;
        arr[off + 1] = 0;
        arr[off + 2] = 0;
        arr[off + 3] = 1;
      }
    }
    return arr;
  }

  const { renderer, size: threlteSize } = useThrelte();

  const geometry = createFullScreenQuadGeometry();

  let imageTexture: THREE.Texture | undefined = $state();
  let imageAspectRatio = $state(1);

  const uniforms = {
    u_time: { value: 0 },
    u_resolution: { value: new THREE.Vector2(1280, 720) },
    u_pixelRatio: { value: renderer.getPixelRatio() },
    u_imageAspectRatio: { value: 1 },
    u_image: { value: null as THREE.Texture | null },
    u_colors: { value: padColorsTo6(colors) },
    u_colorsCount: { value: colors.length },
    u_colorBack: { value: colorBack },
    u_colorInner: { value: colorInner },
    u_innerDistortion: { value: innerDistortion },
    u_outerDistortion: { value: outerDistortion },
    u_outerGlow: { value: outerGlow },
    u_innerGlow: { value: innerGlow },
    u_offset: { value: offsetV },
    u_angle: { value: angle },
    u_size: { value: size },
    u_shape: { value: GemSmokeShapes[shape] },
    u_isImage: { value: true },
    u_originX: { value: 0.5 },
    u_originY: { value: 0.5 },
    u_worldWidth: { value: 1280 },
    u_worldHeight: { value: 720 },
    u_fit: { value: 2 },
    u_scale: { value: scale },
    u_rotation: { value: 0 },
    u_offsetX: { value: 0 },
    u_offsetY: { value: 0 },
  };

  const material = new THREE.RawShaderMaterial({
    glslVersion: THREE.GLSL3,
    uniforms,
    vertexShader: gemSmokeVertexShader,
    fragmentShader: gemSmokeFragmentShader,
    depthWrite: false,
    depthTest: false,
    transparent: true,
  });

  $effect(() => {
    const s = threlteSize.current;
    const dpr = renderer.getPixelRatio();
    const pw = Math.round(s.width * dpr);
    const ph = Math.round(s.height * dpr);
    uniforms.u_resolution.value.set(pw, ph);
    uniforms.u_pixelRatio.value = dpr;
  });

  $effect(() => {
    uniforms.u_colors.value = padColorsTo6(colors);
    uniforms.u_colorsCount.value = colors.length;
  });

  $effect(() => {
    uniforms.u_colorBack.value = colorBack;
  });

  $effect(() => {
    uniforms.u_colorInner.value = colorInner;
  });

  $effect(() => {
    uniforms.u_innerDistortion.value = innerDistortion;
  });

  $effect(() => {
    uniforms.u_outerDistortion.value = outerDistortion;
  });

  $effect(() => {
    uniforms.u_outerGlow.value = outerGlow;
  });

  $effect(() => {
    uniforms.u_innerGlow.value = innerGlow;
  });

  $effect(() => {
    uniforms.u_offset.value = offsetV;
  });

  $effect(() => {
    uniforms.u_angle.value = angle;
  });

  $effect(() => {
    uniforms.u_size.value = size;
  });

  $effect(() => {
    uniforms.u_scale.value = scale;
  });

  $effect(() => {
    uniforms.u_shape.value = GemSmokeShapes[shape];
  });

  $effect(() => {
    if (imageTexture) {
      uniforms.u_image.value = imageTexture;
      uniforms.u_imageAspectRatio.value = imageAspectRatio;
    }
  });

  let currentSpeed = $state(speed);
  $effect(() => {
    currentSpeed = speed;
  });

  useTask(delta => {
    uniforms.u_time.value += delta * currentSpeed;
  });

  onMount(() => {
    (async () => {
      try {
        const processed = await toProcessedGemSmoke(logoSvg);
        const img = new Image();
        const imageUrl = URL.createObjectURL(processed.pngBlob);
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () =>
            reject(new Error('Failed to load processed image'));
          img.src = imageUrl;
        });
        const tex = new THREE.Texture(img);
        tex.wrapS = THREE.ClampToEdgeWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.flipY = false;
        tex.needsUpdate = true;
        imageAspectRatio = img.naturalWidth / img.naturalHeight;
        imageTexture = tex;
      } catch {
        /* gem smoke image load failed */
      }
    })();

    return () => {
      imageTexture?.dispose();
      material.dispose();
      geometry.dispose();
    };
  });
</script>

<T.Mesh {geometry} {material} />
