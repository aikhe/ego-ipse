<script lang="ts">
  import { T, useThrelte } from '@threlte/core';
  import * as THREE from 'three';
  import gsap from 'gsap';

  let {
    index,
    texture,
    hovered,
    isShifted,
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
    totalLength: number;
    width: number;
    height: number;
    onenter: () => void;
    onleave: () => void;
    onclick?: () => void;
  }>();

  const basePos = $derived({
    x: index * 0.9,
    y: index * 0.8,
    z: index * -0.4,
  });

  const shiftedPos = $derived({
    x: index * 0.9 + 6,
    y: index * 0.8 + 2.1,
    z: index * -0.4,
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

    // Update previous shifting state
    const actualPrevIsShifted = prevIsShifted ?? isShifted;
    const shifting = isShifted !== actualPrevIsShifted;
    const shiftDelay = isShifted
      ? (totalLength - 1 - index) * 0.04
      : index * 0.04;
    const delay = shifting ? shiftDelay : 0;

    prevIsShifted = isShifted;

    let hoverOffsetX = 0;
    let hoverLiftY = 0;

    if (hovered !== null) {
      if (isHovered) {
        hoverLiftY = 0.18; // Increase hovered card vertical lift
      } else {
        const distance = index - hovered;
        const absDist = Math.abs(distance);
        const sign = Math.sign(distance);

        // Decay based on distance (spreading horizontally)
        const pushX = 0.18 / absDist;
        hoverOffsetX = sign * pushX;

        // Wave effect: adjacent cards lift UP (diminishing based on distance)
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
</script>

<T.Mesh
  position={[basePos.x, basePos.y, basePos.z]}
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
