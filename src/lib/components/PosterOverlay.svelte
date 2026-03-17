<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { fade } from 'svelte/transition';
  import gsap from 'gsap';

  let { selected = $bindable(), images } = $props<{
    selected: number | null
    images: string[]
  }>()

  // 5 sets to guarantee enough buffer for long swipes
  let duplicatedImages = $derived([...images, ...images, ...images, ...images, ...images]);
  const MIDDLE_SET = 2;

  let container: HTMLDivElement | null = null;
  let isDragging = false;
  let setWidth = 0;
  
  // Momentum tracking
  let velocity = 0;
  let lastX = 0;
  let lastTime = 0;

  $effect(() => {
    if (selected !== null && container) {
      const items = container.querySelectorAll('.poster-overlay__item');
      // Target the exact selected poster within the exact middle set
      const targetIndex = (images.length * MIDDLE_SET) + selected;
      const target = items[targetIndex] as HTMLElement;
      
      if (target) {
        setTimeout(() => {
          // Calculate exact width of one set
          setWidth = (items[images.length] as HTMLElement).offsetLeft - (items[0] as HTMLElement).offsetLeft;
          
          // Instant jump to correct image
          target.scrollIntoView({ behavior: 'auto', inline: 'center' });
        }, 0);
      }
    }
  });

  function close() {
    selected = null;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') close();
  }

  function checkInfiniteScroll() {
    if (!container || setWidth === 0) return;
    
    // Only seamlessly wrap when not actively tweening to avoid visual glitches
    if (!gsap.isTweening(container)) {
      if (container.scrollLeft < setWidth * 1.5) {
        container.scrollLeft += setWidth;
      } else if (container.scrollLeft > setWidth * 3.5) {
        container.scrollLeft -= setWidth;
      }
    }
  }

  function onMouseDown(e: MouseEvent) {
    if (!container) return;
    isDragging = true;
    container.style.cursor = 'grabbing';
    
    lastX = e.pageX;
    lastTime = Date.now();
    velocity = 0;
    gsap.killTweensOf(container); // Stop current scrolls
  }

  function onMouseMove(e: MouseEvent) {
    if (!isDragging || !container) return;
    e.preventDefault();
    
    const deltaX = e.pageX - lastX;
    container.scrollLeft -= deltaX * 1.5;

    // Calculate velocity for inertia release
    const now = Date.now();
    const dt = now - lastTime;
    if (dt > 0) {
      velocity = (e.pageX - lastX) / dt;
    }
    lastX = e.pageX;
    lastTime = now;
  }

  function onMouseUp() {
    if (!isDragging || !container) return;
    isDragging = false;
    container.style.cursor = 'grab';

    // Apply swipe momentum if moving fast enough
    if (Math.abs(velocity) > 0.05) {
      const momentumWalk = velocity * 400; // Multiplier for distance
      gsap.to(container, {
        scrollLeft: container.scrollLeft - momentumWalk,
        duration: 0.8,
        ease: 'power3.out',
        overwrite: 'auto',
        onComplete: checkInfiniteScroll
      });
    } else {
      checkInfiniteScroll();
    }
  }

  function onWheel(e: WheelEvent) {
    if (!container) return;
    
    // Standard vertical scroll wheel (no horizontal native input)
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && e.deltaX === 0) {
      e.preventDefault();
      
      gsap.to(container, {
        scrollLeft: container.scrollLeft + (e.deltaY * 3),
        duration: 0.5,
        ease: 'power2.out',
        overwrite: 'auto',
        onComplete: checkInfiniteScroll
      });
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} onmouseup={onMouseUp} onmousemove={onMouseMove} />

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div 
  class="poster-overlay" 
  transition:fade={{ duration: 300 }}
  onclick={close} 
  aria-modal="true" 
  role="dialog"
>
  <div 
    class="poster-overlay__container" 
    bind:this={container}
    onmousedown={onMouseDown}
    onwheel={onWheel}
    onscroll={checkInfiniteScroll}
    onclick={(e) => e.stopPropagation()}
  >
    {#each duplicatedImages as image, i}
      <div class="poster-overlay__item">
        <img src={image} alt="Poster {(i % images.length) + 1}" draggable="false" />
      </div>
    {/each}
  </div>
  
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
    height: 100%; /* Perfectly fill the 1vw top/bottom padded container */
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 0.5rem; /* Internal padding / gap enhancement */
  }

  .poster-overlay__item img {
    height: 100%;
    width: auto;
    object-fit: contain;
    pointer-events: none;
  }

  /* Contact Button Style for Close Button (Forced Light Theme) */
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
    background: rgba(0, 0, 0, 0.05); /* Light theme --color-overlay-05 */
  }

  /* Responsive adjustments */
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
