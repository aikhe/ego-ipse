import { MediaQuery } from 'svelte/reactivity';
import { cubicOut } from 'svelte/easing';
import { fade } from 'svelte/transition';
import {
  popIn as basePopIn,
  popOut as basePopOut,
  textSwap as baseTextSwap,
} from './transitions';

export const reducedMotion = new MediaQuery('(prefers-reduced-motion: reduce)');

export const popIn: typeof basePopIn = (node, params) =>
  reducedMotion.current
    ? fade(node, { duration: params?.duration ?? 170, easing: cubicOut })
    : basePopIn(node, params);

export const popOut: typeof basePopOut = (node, params) =>
  reducedMotion.current
    ? fade(node, { duration: params?.duration ?? 120, easing: cubicOut })
    : basePopOut(node, params);

export const textSwap: typeof baseTextSwap = (node, params) =>
  reducedMotion.current
    ? fade(node, { duration: 170, easing: cubicOut })
    : baseTextSwap(node, params);
