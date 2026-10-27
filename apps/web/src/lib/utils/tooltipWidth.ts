import type { Action } from 'svelte/action';

// mount at the intrinsic width; only morph between different tip contents.
export const tooltipWidth: Action<HTMLElement, string> = (node, text) => {
  let previousText = text;
  let width = parseFloat(getComputedStyle(node).width);
  let animation: Animation | null = null;

  return {
    update(nextText) {
      if (nextText === previousText) return;
      previousText = nextText;

      // computed width excludes the entrance scale and preserves interrupted tweens.
      const from =
        animation?.playState === 'running'
          ? parseFloat(getComputedStyle(node).width)
          : width;
      animation?.cancel();
      width = parseFloat(getComputedStyle(node).width);
      if (
        Math.abs(from - width) < 1 ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      )
        return;

      animation = node.animate(
        [{ width: `${from}px` }, { width: `${width}px` }],
        {
          duration: 280,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        }
      );
    },
    destroy() {
      animation?.cancel();
    },
  };
};
