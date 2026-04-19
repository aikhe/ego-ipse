<script lang="ts">
  import { fade } from 'svelte/transition';
  import gsap from 'gsap';
  import { getStageScale } from '$lib/utils/stageScale';

  let { selected = $bindable(), images } = $props<{
    selected: number | null;
    images: string[];
  }>();

  let duplicatedImages = $derived([
    ...images,
    ...images,
    ...images,
    ...images,
    ...images,
    ...images,
    ...images,
    ...images,
    ...images,
  ]);
  const MIDDLE_SET = 4;

  let container: HTMLDivElement | null = null;
  let isDragging = false;
  let hasInteracted = false;
  let setWidth = 0;

  // velocity tracking
  let velocity = 0;
  let lastX = 0;
  let lastTime = 0;
  let proxy = { x: 0 };
  let loadedStates = $state<Record<number, boolean>>({});

  function calculateSetWidth() {
    if (!container) return;
    const items = container.querySelectorAll('.poster-overlay__item');
    if (items.length <= images.length) return;

    const itemWidth = items[0].getBoundingClientRect().width;
    const gap = parseFloat(window.getComputedStyle(container).gap) || 0;
    setWidth = (itemWidth + gap) * images.length;
  }

  function centerGallery() {
    calculateSetWidth();
    if (!container || selected === null || hasInteracted || setWidth === 0)
      return;

    const items = container.querySelectorAll('.poster-overlay__item');
    const targetIndex = images.length * MIDDLE_SET + selected;
    const target = items[targetIndex] as HTMLElement;

    if (target) {
      const containerWidth = container.offsetWidth;
      const targetWidth = target.offsetWidth;
      const targetX = target.offsetLeft - containerWidth / 2 + targetWidth / 2;

      container.scrollLeft = targetX;
      proxy.x = targetX;
    }
  }

  $effect(() => {
    if (selected !== null && container) {
      hasInteracted = false;
      gsap.killTweensOf(proxy);
      setTimeout(centerGallery, 10);
    }
  });

  function close() {
    selected = null;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') close();
  }

  function applyWrap() {
    if (!container || setWidth === 0) return;

    const minSafe = setWidth * 3;
    const maxSafe = setWidth * 6;
    const current = container.scrollLeft;

    if (current < minSafe || current > maxSafe) {
      const offset = (((current - minSafe) % setWidth) + setWidth) % setWidth;
      const wrappedX = setWidth * 4 + offset;

      container.scrollLeft = wrappedX;
      proxy.x = wrappedX;
    }
  }

  function onPointerDown(e: PointerEvent) {
    if (!container) return;
    isDragging = true;
    hasInteracted = true;
    container.setPointerCapture(e.pointerId);

    lastX = e.clientX / getStageScale();
    lastTime = Date.now();
    velocity = 0;
    gsap.killTweensOf(proxy);
    proxy.x = container.scrollLeft;
  }

  function onPointerMove(e: PointerEvent) {
    if (!isDragging || !container) return;

    const x = e.clientX / getStageScale();
    const now = Date.now();
    const dt = now - lastTime;
    const dx = x - lastX;

    if (dt > 0) {
      velocity = dx / dt;
    }

    container.scrollLeft -= dx;
    proxy.x = container.scrollLeft;

    applyWrap();

    lastX = x;
    lastTime = now;
  }

  function onPointerUp(e: PointerEvent) {
    if (!isDragging || !container) return;
    isDragging = false;
    container.releasePointerCapture(e.pointerId);

    if (Math.abs(velocity) > 0.1) {
      const momentum = velocity * -280; // Dampened momentum
      const targetX = container.scrollLeft + momentum;

      gsap.to(proxy, {
        x: targetX,
        duration: 1,
        ease: 'power3.out',
        overwrite: 'auto',
        onUpdate: () => {
          if (!container) return;
          container.scrollLeft = proxy.x;
          applyWrap();
        },
      });
    } else {
      applyWrap();
    }
  }

  function onWheel(e: WheelEvent) {
    if (!container || setWidth === 0) return;
    hasInteracted = true;

    // Smooth scroll with higher sensitivity
    const delta =
      ((Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * 3.5) /
      getStageScale();

    if (!gsap.isTweening(proxy)) {
      proxy.x = container.scrollLeft;
    }

    gsap.to(proxy, {
      x: proxy.x + delta,
      duration: 1,
      ease: 'power3.out',
      overwrite: 'auto',
      onUpdate: () => {
        if (!container) return;
        container.scrollLeft = proxy.x;
        applyWrap();
      },
    });
  }
</script>

<svelte:window onresize={calculateSetWidth} onkeydown={handleKeydown} />

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="poster-overlay"
  transition:fade={{ duration: 300 }}
  onclick={close}
  aria-modal="true"
  role="dialog"
  tabindex="-1"
>
  <div
    class="poster-overlay__container"
    bind:this={container}
    onpointerdown={onPointerDown}
    onpointermove={onPointerMove}
    onpointerup={onPointerUp}
    onpointercancel={onPointerUp}
    onwheel={onWheel}
    onclick={e => e.stopPropagation()}
    style="touch-action: pan-y;"
  >
    {#each duplicatedImages as image, i (i)}
      <div class="poster-overlay__item">
        <div class="poster-overlay__skeleton"></div>
        <img
          src={image}
          alt="Poster {(i % images.length) + 1}"
          class="poster-overlay__image"
          class:loaded={loadedStates[i]}
          draggable="false"
          onload={() => {
            loadedStates[i] = true;
          }}
        />
      </div>
    {/each}
  </div>

  <!-- fallback resize calculation image load -->
  <img
    src={images[0]}
    style="display:none;"
    onload={calculateSetWidth}
    alt=""
    aria-hidden="true"
  />

  <button
    class="poster-overlay__close ui-button ui-button--corners"
    onclick={close}
  >
    <span>CLOSE</span>
  </button>
</div>

<style>
  .poster-overlay {
    align-items: center;
    backdrop-filter: blur(12px);
    background: rgb(255 255 255 / 8%);
    cursor: zoom-out;
    display: flex;
    height: var(--page-stage-height, 100vh);
    justify-content: center;
    left: 0;
    position: fixed;
    top: 0;
    user-select: none;
    width: var(--page-stage-width, 100vw);
    z-index: 1000;
  }

  .poster-overlay__container {
    align-items: center;
    cursor: grab;
    display: flex;
    gap: 0.5rem;
    height: 100%;
    overflow: auto hidden;
    -ms-overflow-style: none;
    padding: 1vw;
    position: relative;
    scroll-behavior: auto;
    scrollbar-width: none;
    user-select: none;
    width: 100%;
  }

  .poster-overlay__container:active {
    cursor: grabbing;
  }

  .poster-overlay__container::-webkit-scrollbar {
    display: none;
  }

  .poster-overlay__item {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    height: 100%;
    justify-content: center;
    padding: 0 0.5rem;
    position: relative;
    width: auto;
  }

  .poster-overlay__skeleton {
    animation: skeleton-pulse 1.8s ease-in-out infinite;
    aspect-ratio: 2848 / 3690;
    background: #fff;
    height: 100%;
    position: absolute;
    z-index: 0;
  }

  .poster-overlay__image {
    aspect-ratio: 2848 / 3690;
    height: 100%;
    object-fit: contain;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.4s ease;
    width: auto;
    z-index: 1;
  }

  .poster-overlay__image.loaded {
    opacity: 1;
  }

  @keyframes skeleton-pulse {
    0%,
    100% {
      opacity: 0.4;
    }

    50% {
      opacity: 0.8;
    }
  }

  .poster-overlay__close {
    background: rgb(0 0 0 / 2%);
    border: 1px solid rgb(0 0 0 / 30%);
    color: #080807;
    position: fixed;
    right: 2.4rem;
    top: 2.4rem;
    z-index: 1001;
  }

  .poster-overlay__close:hover {
    background: rgb(0 0 0 / 5%);
  }

  @media (max-width: 768px) {
    .poster-overlay__container {
      gap: 1rem;
      padding: 0 4vw;
    }

    .poster-overlay__item {
      height: 70vh;
      padding: 0 0.5rem;
    }

    .poster-overlay__close {
      right: 1.5rem;
      top: 1.5rem;
    }
  }
</style>
