import { cubicIn, cubicOut, quartOut } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';

type PopParams = { duration?: number };
type SwapParams = { dx?: number; dy?: number; duration?: number };

// subtle settle: faint scale with no overshoot in, quick fade out.
// base transform is read live so centering is preserved mid-animation.
export function popIn(
  node: HTMLElement,
  { duration = 170 }: PopParams = {}
): TransitionConfig {
  const base = getComputedStyle(node).transform;
  return {
    duration,
    easing: cubicOut,
    css: (t: number) =>
      `transform: ${base} scale(${0.94 + 0.06 * t}); opacity: ${t};`,
  };
}

export function popOut(
  node: HTMLElement,
  { duration = 120 }: PopParams = {}
): TransitionConfig {
  const base = getComputedStyle(node).transform;
  return {
    duration,
    easing: cubicIn,
    css: (t: number) =>
      `transform: ${base} scale(${0.97 + 0.03 * t}); opacity: ${t};`,
  };
}

// text swap: new text glides in from the side the cursor came from,
// sharpening from a soft blur with a long decelerating ease
export function textSwap(
  _node: HTMLElement,
  { dx = 0, dy = 1, duration = 280 }: SwapParams = {}
): TransitionConfig {
  return {
    duration,
    easing: quartOut,
    css: (t: number) =>
      `transform: translate(${dx * (1 - t) * 10}px, ${dy * (1 - t) * 10}px); filter: blur(${(1 - t) * 6}px); opacity: ${t};`,
  };
}
