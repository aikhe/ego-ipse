<script lang="ts">
  import { T, useThrelte } from '@threlte/core';
  import * as THREE from 'three';
  import gsap from 'gsap';

  let {
    index,
    texture,
    hovered,
    isShifted,
    scale,
    spacingScale,
    staggerScale,
    downShift,
    totalLength,
    width,
    height,
    onenter,
    onleave,
    onclick,
  } = $props<{
    index: number;
    texture: THREE.Texture;
    hovered: number | null;
    isShifted: boolean;
    scale: number;
    spacingScale: number;
    staggerScale: number;
    downShift: number;
    totalLength: number;
    width: number;
    height: number;
    onenter: () => void;
    onleave: () => void;
    onclick?: () => void;
  }>();

  const posterStepX = 0.8;
  const posterStepY = 0.5;
  const posterStepZ = -0.74;
  const shiftStaggerDelay = 0.03;
  const posterOffsetX = -0.34;
  const posterLiftY = 1.6;
  const stackMidIndex = $derived((totalLength - 1) / 2);
  const centeredIndex = $derived(index - stackMidIndex);
  const responsiveStepX = $derived(posterStepX * spacingScale);
  const responsiveStepY = $derived(posterStepY * spacingScale);
  const responsiveStepZ = $derived(posterStepZ * spacingScale);
  const responsiveShiftX = $derived(6 * spacingScale);
  const responsiveShiftY = $derived(2.1 * spacingScale);
  const responsiveStaggerDelay = $derived(shiftStaggerDelay * staggerScale);

  const basePos = $derived({
    x: centeredIndex * responsiveStepX + posterOffsetX,
    y: centeredIndex * responsiveStepY + posterLiftY - downShift,
    z: centeredIndex * responsiveStepZ,
  });

  const shiftedPos = $derived({
    x: basePos.x + responsiveShiftX,
    y: basePos.y + responsiveShiftY,
    z: basePos.z,
  });

  let mesh: THREE.Mesh | null = null;
  let material: THREE.MeshBasicMaterial | null = null;

  const { invalidate } = useThrelte();

  const colorNormal = new THREE.Color(0xffffff);
  const colorDimmed = new THREE.Color(0x888888);

  let prevIsShifted: boolean | null = null;

  $effect(() => {
    if (!mesh || !material) return;

    const isHovered = hovered === index;
    const isDimmed = hovered !== null && hovered !== index;

    // update previous shifting state
    const actualPrevIsShifted = prevIsShifted ?? isShifted;
    const shifting = isShifted !== actualPrevIsShifted;
    const shiftDelay = isShifted
      ? (totalLength - 1 - index) * responsiveStaggerDelay
      : index * responsiveStaggerDelay;
    const delay = shifting ? shiftDelay : 0;

    prevIsShifted = isShifted;

    let hoverOffsetX = 0;
    let hoverLiftY = 0;

    if (hovered !== null) {
      if (isHovered) {
        hoverLiftY = 0.18; // increase hovered card vertical lift
      } else {
        const distance = index - hovered;
        const absDist = Math.abs(distance);
        const sign = Math.sign(distance);

        // Decay based on distance (spreading horizontally)
        const pushX = 0.18 / absDist;
        hoverOffsetX = sign * pushX;

        // wave effect: adjacent cards lift UP (diminishing based on distance)
        hoverLiftY = 0.1 / absDist;
      }
    }

    // smooth transitions via gsap
    const targetColor = isDimmed ? colorDimmed : colorNormal;
    const currentBaseY = isShifted ? shiftedPos.y : basePos.y;
    const targetY = currentBaseY + hoverLiftY;
    const targetX = (isShifted ? shiftedPos.x : basePos.x) + hoverOffsetX;

    // depth isolation to prevent slicing
    mesh.renderOrder = isHovered ? 50 : index;
    material.depthTest = !isHovered;
    material.opacity = 1;

    // gsap for color
    gsap.to(material.color, {
      r: targetColor.r,
      g: targetColor.g,
      b: targetColor.b,
      duration: 0.4,
      ease: 'power2.out',
      overwrite: 'auto',
      onUpdate: invalidate,
    });

    // position animation — faster for hover, slower for shift
    const duration = shifting ? 0.8 : 0.5;
    gsap.to(mesh.position, {
      x: targetX,
      y: targetY,
      duration,
      delay: delay,
      ease: 'power3.out',
      overwrite: 'auto',
      onUpdate: invalidate,
    });
  });

  $effect(() => {
    if (!mesh) return;

    gsap.to(mesh.scale, {
      x: scale,
      y: scale,
      duration: 0.45,
      ease: 'power2.out',
      overwrite: 'auto',
      onUpdate: invalidate,
    });
  });
</script>

<T.Mesh
  position={[basePos.x, basePos.y, basePos.z]}
  scale={[scale, scale, 1]}
  oncreate={(ref: THREE.Mesh) => {
    mesh = ref;
  }}
  onpointerenter={(e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    document.body.style.cursor = 'pointer';
    onenter();
  }}
  onpointerdown={(e: { nativeEvent: { stopPropagation: () => void } }) => {
    e.nativeEvent.stopPropagation();
  }}
  onpointerleave={() => {
    document.body.style.cursor = 'auto';
    onleave();
  }}
  onclick={(e: {
    stopPropagation: () => void;
    nativeEvent: { stopPropagation: () => void };
  }) => {
    e.stopPropagation();
    e.nativeEvent.stopPropagation();
    onclick?.();
  }}
>
  <T.PlaneGeometry args={[width, height]} />
  <T.MeshBasicMaterial
    transparent
    map={texture}
    oncreate={(ref: THREE.MeshBasicMaterial) => {
      material = ref;
    }}
  />
</T.Mesh>
