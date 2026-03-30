<script lang="ts">
  import { fade } from 'svelte/transition';
  import gsap from 'gsap';

  let { selected = $bindable(), images } = $props<{
    selected: number | null
    images: string[]
  }>()

  // 9 sets for massive infinite buffer preventing fast trackers from ever hitting the logical wall
  let duplicatedImages = $derived([...images, ...images, ...images, ...images, ...images, ...images, ...images, ...images, ...images]);
  const MIDDLE_SET = 4;

  let container: HTMLDivElement | null = null;
  let isDragging = false;
  let hasInteracted = false;
  let setWidth = 0;
  let wheelTargetX = 0;
  
  // velocity tracking
  let velocity = 0;
  let lastX = 0;
  let lastTime = 0;
  let proxy = { x: 0 };

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
    if (!container || selected === null || hasInteracted || setWidth === 0) return;
    
    const items = container.querySelectorAll('.poster-overlay__item');
    const targetIndex = (images.length * MIDDLE_SET) + selected;
    const target = items[targetIndex] as HTMLElement;
    
    if (target) {
      const containerWidth = container.offsetWidth;
      const targetWidth = target.offsetWidth;
      const targetX = target.offsetLeft - (containerWidth / 2) + (targetWidth / 2);
      
      container.scrollLeft = targetX;
      proxy.x = targetX;
    }
  }

  $effect(() => {
    if (selected !== null && container) {
      hasInteracted = false;
      gsap.killTweensOf(proxy);
      setTimeout(centerGallery, 10); // Slight delay for DOM layout
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
      const offset = ((current - minSafe) % setWidth + setWidth) % setWidth;
      const wrappedX = (setWidth * 4) + offset;
      
      container.scrollLeft = wrappedX;
      proxy.x = wrappedX;
    }
  }

  function onPointerDown(e: PointerEvent) {
    if (!container) return;
    isDragging = true;
    hasInteracted = true;
    container.setPointerCapture(e.pointerId);
    
    lastX = e.clientX;
    lastTime = Date.now();
    velocity = 0;
    gsap.killTweensOf(proxy);
    proxy.x = container.scrollLeft;
  }

  function onPointerMove(e: PointerEvent) {
    if (!isDragging || !container) return;
    
    const x = e.clientX;
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
        }
      });
    } else {
      applyWrap();
    }
  }

  function onWheel(e: WheelEvent) {
    if (!container || setWidth === 0) return;
    hasInteracted = true;
    
    // Smooth scroll with higher sensitivity
    const delta = (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * 3.5;
    
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
      }
    });
  }

</script>

<svelte:window 
  onresize={calculateSetWidth} 
  onkeydown={handleKeydown} 
/>

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
    onclick={(e) => e.stopPropagation()}
    style="touch-action: pan-y;"
  >
    {#each duplicatedImages as image, i (i)}
      <div class="poster-overlay__item">
        <img 
          src={image} 
          alt="Poster {(i % images.length) + 1}" 
          draggable="false" 
        />
      </div>
    {/each}
  </div>
  
  <!-- fallback resize calculation image load -->
  <img src={images[0]} style="display:none;" onload={calculateSetWidth} alt="" aria-hidden="true" />
  
  <button class="poster-overlay__close contact-btn" onclick={close}>
    <span>CLOSE</span>
  </button>
</div>

<style>
  .poster-overlay {
    position: fixed;
    inset: 0;
    z-index: 1000;
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(12px);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: zoom-out;
    user-select: none;
  }

  .poster-overlay__container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    overflow-x: auto;
    overflow-y: hidden;
    scroll-behavior: auto;
    padding: 1vw;
    gap: 0.5rem;
    scrollbar-width: none;
    -ms-overflow-style: none;
    align-items: center;
    cursor: grab;
    user-select: none;
  }

  .poster-overlay__container:active {
    cursor: grabbing;
  }

  .poster-overlay__container::-webkit-scrollbar {
    display: none;
  }

  .poster-overlay__item {
    flex: 0 0 auto;
    width: auto;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 0.5rem;
  }

  .poster-overlay__item img {
    height: 100%;
    width: auto;
    aspect-ratio: 2848 / 3690;
    object-fit: contain;
    pointer-events: none;
  }

  .contact-btn {
    position: fixed;
    top: 2.4rem;
    right: 2.4rem;
    background: rgba(0, 0, 0, 0.02);
    color: #080807;
    border: 1px solid rgba(0, 0, 0, 0.3);
    padding: 6px 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    
    font-family: 'Geist Mono', monospace;
    font-size: 0.875rem;
    font-weight: 500;
    letter-spacing: 0.34%;
    line-height: normal;
    
    z-index: 1001;
    transition: background 0.2s;
  }

  .contact-btn::before {
    content: '';
    position: absolute;
    inset: -1px;
    background:
      linear-gradient(to right, #080807 1px, transparent 1px) 0 0,
      linear-gradient(to bottom, #080807 1px, transparent 1px) 0 0,
      linear-gradient(to left, #080807 1px, transparent 1px) 100% 0,
      linear-gradient(to bottom, #080807 1px, transparent 1px) 100% 0,
      linear-gradient(to right, #080807 1px, transparent 1px) 0 100%,
      linear-gradient(to top, #080807 1px, transparent 1px) 0 100%,
      linear-gradient(to left, #080807 1px, transparent 1px) 100% 100%,
      linear-gradient(to top, #080807 1px, transparent 1px) 100% 100%;
    background-repeat: no-repeat;
    background-size: 8px 8px;
    pointer-events: none;
  }

  .contact-btn:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  @media (max-width: 768px) {
    .poster-overlay__container {
      padding: 0 4vw;
      gap: 1rem;
    }
    .poster-overlay__item {
      height: 70vh;
      padding: 0 0.5rem;
    }
    .contact-btn {
      top: 1.5rem;
      right: 1.5rem;
    }
  }
</style>
