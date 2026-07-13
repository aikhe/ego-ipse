import { onDestroy } from 'svelte';
import { uiState } from '$lib/state/ui.svelte';
import gsap from 'gsap';

export type AnimationConfig = {
  baseGlow: number;
  glowEasing: string;
  outerDistEaseOut: string;
};

export function useShaderAnimations() {
  const glowTarget = $state({ value: 0 });
  const innerGlowTarget = $state({ value: 1 });
  const innerDistortionTarget = $state({ value: 1 });
  const outerDistortionTarget = $state({ value: 1 });

  const config = $state<AnimationConfig>({
    baseGlow: 0.26,
    glowEasing: 'power3.out',
    outerDistEaseOut: 'cubic-bezier(1, 0.002, 0.636, 0.996)',
  });

  function setAnimationConfig(cfg: AnimationConfig) {
    config.baseGlow = cfg.baseGlow;
    config.glowEasing = cfg.glowEasing;
    config.outerDistEaseOut = cfg.outerDistEaseOut;
  }

  $effect(() => {
    if (uiState.isProjectView) {
      const timer = setTimeout(() => {
        uiState.isShaderShifted = true;
      }, 800);
      return () => clearTimeout(timer);
    } else {
      if (uiState.isShaderShifted) {
        const timer = setTimeout(() => {
          uiState.isShaderShifted = false;
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  });

  $effect(() => {
    if (uiState.layoutMode !== 'shader') {
      gsap.killTweensOf(glowTarget);
      return;
    }
    const bg = config.baseGlow;
    const ease = config.glowEasing;
    const shouldShow = uiState.isProjectView === uiState.isShaderShifted;
    const outerTarget = shouldShow ? bg : 0;
    const duration = shouldShow ? 1.4 : 1.6;

    gsap.killTweensOf(glowTarget);
    gsap.to(glowTarget, {
      value: outerTarget,
      duration,
      delay: 0.2,
      ease,
      overwrite: 'auto',
    });
  });

  $effect(() => {
    if (uiState.layoutMode !== 'shader') {
      gsap.killTweensOf(innerGlowTarget);
      return;
    }
    const ease = config.glowEasing;
    const shouldShow = uiState.isProjectView === uiState.isShaderShifted;
    const innerTarget = shouldShow ? 1 : 0;

    gsap.killTweensOf(innerGlowTarget);
    gsap.to(innerGlowTarget, {
      value: innerTarget,
      duration: 1.4,
      ease,
      overwrite: 'auto',
    });
  });

  $effect(() => {
    if (uiState.layoutMode !== 'shader') {
      gsap.killTweensOf(innerDistortionTarget);
      return;
    }
    const ease = config.glowEasing;
    const shouldShow = uiState.isProjectView === uiState.isShaderShifted;
    const target = shouldShow ? 1 : 0.1;

    gsap.killTweensOf(innerDistortionTarget);
    gsap.to(innerDistortionTarget, {
      value: target,
      duration: 4,
      ease,
      overwrite: 'auto',
    });
  });

  $effect(() => {
    if (uiState.layoutMode !== 'shader') {
      gsap.killTweensOf(outerDistortionTarget);
      return;
    }
    const ease = config.glowEasing;
    const outerEase = config.outerDistEaseOut;
    const shouldShow = uiState.isProjectView === uiState.isShaderShifted;
    const target = shouldShow ? 1 : 0;
    const duration = shouldShow ? 1.8 : 1.4;

    gsap.killTweensOf(outerDistortionTarget);
    gsap.to(outerDistortionTarget, {
      value: target,
      duration,
      delay: 0.28,
      ease: shouldShow ? ease : outerEase,
      overwrite: 'auto',
    });
  });

  onDestroy(() => {
    gsap.killTweensOf(glowTarget);
    gsap.killTweensOf(innerGlowTarget);
    gsap.killTweensOf(innerDistortionTarget);
    gsap.killTweensOf(outerDistortionTarget);
  });

  return {
    glowTarget,
    innerGlowTarget,
    innerDistortionTarget,
    outerDistortionTarget,
    setAnimationConfig,
  };
}
