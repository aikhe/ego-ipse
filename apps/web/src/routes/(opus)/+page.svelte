<script lang="ts">
  import { resolve } from '$app/paths';
  import { uiState } from '$lib/state/ui.svelte';
  import OpusNav from '$lib/components/Opus/OpusNav.svelte';
  import { selectedWorks } from '$lib/data/works';
  import { mergePreferSanity } from '$lib/sanity/opusWorks';
  import type { PageProps } from './$types';
  import WorkCard from '$lib/components/Work/WorkCard.svelte';
  import ike from '$lib/assets/ike.webp';
  import PosterOverlay from '$lib/components/Poster/PosterOverlay.svelte';
  import OpusFooter from '$lib/components/Opus/OpusFooter.svelte';
  import OpusGithub from '$lib/components/Opus/OpusGithub.svelte';
  import poster1 from '$lib/assets/posters/1.webp';
  import poster2 from '$lib/assets/posters/2.webp';
  import poster3 from '$lib/assets/posters/3.webp';
  import poster4 from '$lib/assets/posters/4.webp';

  const posters = [poster1, poster4, poster3, poster2];

  let { data }: PageProps = $props();

  // sanity first, hardcoded stays as fallback.
  const displayWorks = $derived(
    mergePreferSanity(data.sanitySelected ?? [], selectedWorks)
  );

  let selectedPoster = $state<number | null>(null);

  let viewportEl = $state<HTMLDivElement | null>(null);
  let trackEl = $state<HTMLDivElement | null>(null);
  let introEl = $state<HTMLDivElement | null>(null);
  let postersSectionEl = $state<HTMLDivElement | null>(null);
  let valuesEl = $state<HTMLDivElement | null>(null);
  let valuesTitleEl = $state<HTMLParagraphElement | null>(null);
  let githubEl = $state<HTMLDivElement | null>(null);
  let githubTitleEl = $state<HTMLParagraphElement | null>(null);
  let footerEl = $state<HTMLDivElement | null>(null);
  let pos = $state(0);
  let maxPos = $state(0);
  // true native scroll limit (can differ from maxPos on mid widths where the
  // viewport overflows the column). drives the mobile button states.
  let scrollMax = $state(0);

  function updateBounds() {
    if (!viewportEl || !trackEl) return;
    // measured, not hardcoded: col3 shrinks on mid screens and goes
    // full-width on mobile. the last poster settles at the col3 right
    // edge, never past the viewport edge.
    const parentW = viewportEl.parentElement?.clientWidth;
    const colW = parentW ?? viewportEl.clientWidth;
    const edge = Math.min(colW, viewportEl.clientWidth);
    maxPos = Math.max(0, trackEl.scrollWidth - edge);
    scrollMax = Math.max(0, trackEl.scrollWidth - viewportEl.clientWidth);
    pos = Math.min(pos, maxPos);
  }

  function clamp(v: number) {
    return Math.max(0, Math.min(v, maxPos));
  }

  function go(dir: -1 | 1) {
    const first = trackEl?.querySelector(
      '.opus-poster-wrap'
    ) as HTMLElement | null;
    const gap = 0.7 * 16;
    const step = first ? first.offsetWidth + gap : 36 * 8;
    pos = clamp(pos + dir * step);
  }

  // posters travel two ways: on touch devices the viewport is a native
  // horizontal scroller (effortless swipe, momentum, OS-level direction
  // handling). everywhere else the track is moved with transform + buttons.
  // `touch-action: pan-x pan-y` in CSS keeps vertical page scrolls working
  // from inside the posters in both modes.
  let nativeSwipe = $state(false);
  let scrollPos = $state(0);

  $effect(() => {
    const mq = window.matchMedia('(hover: none)');
    const sync = () => {
      nativeSwipe = mq.matches;
    };
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  });

  // watches the native scroller: keeps the arrow buttons in sync and, once
  // the scroll comes to rest, glides onto the winning card.
  $effect(() => {
    if (!viewportEl || !nativeSwipe) return;
    const viewport = viewportEl;
    const onScroll = () => {
      scrollPos = viewport.scrollLeft;
      if (settling) return;
      if (quietTimer) clearTimeout(quietTimer);
      quietTimer = setTimeout(() => settleFromRest(), 140);
    };
    onScroll();
    viewport.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      viewport.removeEventListener('scroll', onScroll);
      if (quietTimer) {
        clearTimeout(quietTimer);
        quietTimer = null;
      }
    };
  });

  const atStart = $derived(nativeSwipe ? scrollPos <= 1 : pos <= 0);
  const atEnd = $derived(
    nativeSwipe ? scrollPos >= scrollMax - 1 : pos >= maxPos
  );

  function nudge(dir: -1 | 1) {
    if (nativeSwipe && viewportEl) {
      cancelSettle();
      viewportEl.scrollBy({ left: dir * stepWidth(), behavior: 'smooth' });
      return;
    }
    go(dir);
  }

  // --- native swipe settle (touch devices) ---
  // the drag itself stays 100% native scroll. once it comes to rest we glide
  // onto the winning card with a slow ease: the largest-visible card, biased
  // one step in the swipe direction so even a short swipe steps forward
  // instead of getting stuck between cards.
  let settling = false;
  let touchActive = false;
  let settleRaf = 0;
  let quietTimer: ReturnType<typeof setTimeout> | null = null;
  let gestureStartScroll = 0;
  let gestureStartCard = 0;

  function visibleIndex(): number {
    if (!viewportEl || !trackEl) return 0;
    const viewRect = viewportEl.getBoundingClientRect();
    const wraps = Array.from(trackEl.children) as HTMLElement[];
    let best = 0;
    let bestVis = -Infinity;
    wraps.forEach((w, i) => {
      const r = w.getBoundingClientRect();
      const vis =
        Math.min(r.right, viewRect.right) - Math.max(r.left, viewRect.left);
      if (vis > bestVis) {
        bestVis = vis;
        best = i;
      }
    });
    return best;
  }

  function settleFromRest() {
    if (!viewportEl || !trackEl || settling || touchActive) return;
    const wraps = Array.from(trackEl.children) as HTMLElement[];
    if (wraps.length === 0) return;
    const trackRect = trackEl.getBoundingClientRect();
    const cur = viewportEl.scrollLeft;
    const maxS = Math.max(0, viewportEl.scrollWidth - viewportEl.clientWidth);
    const starts = wraps.map(
      w => w.getBoundingClientRect().left - trackRect.left
    );
    // already on a card: nothing to do.
    if (starts.some(s => Math.abs(s - cur) < 2)) return;
    const displacement = gestureStartScroll - cur;
    const step = stepWidth();
    let idx = visibleIndex();
    if (step > 0 && Math.abs(displacement) <= step * 0.5) {
      if (displacement > 24)
        idx = Math.min(wraps.length - 1, gestureStartCard + 1);
      else if (displacement < -24) idx = Math.max(0, gestureStartCard - 1);
    }
    glideTo(Math.max(0, Math.min(starts[idx] ?? cur, maxS)));
  }

  function glideTo(target: number) {
    if (!viewportEl) return;
    cancelSettle();
    const viewport = viewportEl;
    const from = viewport.scrollLeft;
    if (Math.abs(target - from) < 2) return;
    settling = true;
    const dist = target - from;
    const dur = 480;
    const t0 = performance.now();
    const frame = (t: number) => {
      const k = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - k, 3);
      viewport.scrollLeft = from + dist * eased;
      if (k < 1) {
        settleRaf = requestAnimationFrame(frame);
      } else {
        settling = false;
        settleRaf = 0;
        scrollPos = viewport.scrollLeft;
      }
    };
    settleRaf = requestAnimationFrame(frame);
  }

  function cancelSettle() {
    if (settleRaf) {
      cancelAnimationFrame(settleRaf);
      settleRaf = 0;
    }
    settling = false;
  }

  // tracks the touch gesture so the settle knows the swipe direction. the
  // drag itself is untouched, native scroll owns it.
  $effect(() => {
    if (!viewportEl || !nativeSwipe) return;
    const viewport = viewportEl;
    const onTouchStart = () => {
      touchActive = true;
      cancelSettle();
      gestureStartScroll = viewport.scrollLeft;
      gestureStartCard = visibleIndex();
    };
    const onTouchDone = () => {
      touchActive = false;
      if (quietTimer) clearTimeout(quietTimer);
      quietTimer = setTimeout(() => settleFromRest(), 140);
    };
    viewport.addEventListener('touchstart', onTouchStart, { passive: true });
    viewport.addEventListener('touchend', onTouchDone);
    viewport.addEventListener('touchcancel', onTouchDone);
    return () => {
      viewport.removeEventListener('touchstart', onTouchStart);
      viewport.removeEventListener('touchend', onTouchDone);
      viewport.removeEventListener('touchcancel', onTouchDone);
    };
  });

  // fallback swipe for hover-capable touch screens (touch laptops): the
  // same direction-safe pattern, horizontal drags move the posters while
  // vertical drags are left alone for the page. skipped entirely when the
  // native scroller owns the gesture.
  let dragging = $state(false);
  let justSwiped = false;

  function stepWidth() {
    const first = trackEl?.querySelector(
      '.opus-poster-wrap'
    ) as HTMLElement | null;
    const gap = 0.7 * 16;
    return first ? first.offsetWidth + gap : 36 * 8;
  }

  $effect(() => {
    if (!viewportEl || nativeSwipe) return;
    const viewport = viewportEl;
    let startX = 0;
    let startY = 0;
    let startPos = 0;
    // sticky horizontal only: vertical stays unclaimed so the page always
    // keeps scrolling. never lock to vertical, a strict early y-lock is what
    // kills slightly diagonal swipes.
    let horizontal = false;

    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
      startPos = pos;
      horizontal = false;
      dragging = false;
    };

    const onMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      if (!horizontal) {
        // engage once clearly horizontal; otherwise return early and let the
        // page scroll natively.
        if (!(Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.25)) return;
        horizontal = true;
        dragging = true;
      }
      // horizontal: own the gesture so the page doesn't scroll sideways.
      e.preventDefault();
      pos = clamp(startPos - dx);
    };

    const onEnd = (cancelled: boolean) => {
      if (horizontal && !cancelled) {
        // biased snap: a deliberate swipe commits to the next card in that
        // direction instead of falling back, so short swipes still advance.
        const step = stepWidth();
        const moved = startPos - pos;
        const threshold = Math.min(48, step * 0.18);
        let target = pos;
        if (step > 0 && moved > threshold) target = startPos + step;
        else if (step > 0 && moved < -threshold) target = startPos - step;
        else if (step > 0) target = Math.round(pos / step) * step;
        pos = clamp(target);
        justSwiped = Math.abs(pos - startPos) > 2;
        setTimeout(() => (justSwiped = false), 350);
      } else if (horizontal) {
        // browser took over (page scroll): settle quietly, no click follows.
        const step = stepWidth();
        if (step > 0) pos = clamp(Math.round(pos / step) * step);
        justSwiped = false;
      }
      horizontal = false;
      dragging = false;
    };

    const onTouchEnd = () => onEnd(false);
    const onTouchCancel = () => onEnd(true);

    viewport.addEventListener('touchstart', onStart, { passive: true });
    viewport.addEventListener('touchmove', onMove, { passive: false });
    viewport.addEventListener('touchend', onTouchEnd);
    viewport.addEventListener('touchcancel', onTouchCancel);
    return () => {
      viewport.removeEventListener('touchstart', onStart);
      viewport.removeEventListener('touchmove', onMove);
      viewport.removeEventListener('touchend', onTouchEnd);
      viewport.removeEventListener('touchcancel', onTouchCancel);
    };
  });

  function openPoster(i: number) {
    // a swipe ending on a card fires click: swallow it, keep the overlay shut.
    if (justSwiped) {
      justSwiped = false;
      return;
    }
    selectedPoster = i;
  }

  $effect(() => {
    if (!viewportEl || !trackEl) return;
    updateBounds();
    const ro = new ResizeObserver(() => updateBounds());
    ro.observe(viewportEl);
    ro.observe(trackEl);
    const onResize = () => updateBounds();
    window.addEventListener('resize', onResize);
    const imgs = trackEl.querySelectorAll('img');
    const onLoad = () => updateBounds();
    imgs.forEach(im => im.addEventListener('load', onLoad));
    const t1 = setTimeout(updateBounds, 100);
    const t2 = setTimeout(updateBounds, 600);
    return () => {
      window.removeEventListener('resize', onResize);
      clearTimeout(t1);
      clearTimeout(t2);
      imgs.forEach(im => im.removeEventListener('load', onLoad));
      ro.disconnect();
    };
  });

  $effect(() => {
    if (!introEl) return;
    const sync = () => {
      const h = introEl!.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--opus-intro-h', `${h}px`);
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(introEl);
    window.addEventListener('resize', sync);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', sync);
    };
  });

  $effect(() => {
    if (!valuesEl || !valuesTitleEl) return;
    const sync = () => {
      const h = valuesEl!.getBoundingClientRect().height;
      const th = valuesTitleEl!.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--opus-values-h', `${h}px`);
      document.documentElement.style.setProperty(
        '--opus-values-title-h',
        `${th}px`
      );
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(valuesEl);
    ro.observe(valuesTitleEl);
    window.addEventListener('resize', sync);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', sync);
    };
  });
  $effect(() => {
    if (!githubEl || !githubTitleEl) return;
    const sync = () => {
      const h = githubEl!.getBoundingClientRect().height;
      const th = githubTitleEl!.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--opus-github-h', `${h}px`);
      document.documentElement.style.setProperty(
        '--opus-github-title-h',
        `${th}px`
      );
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(githubEl);
    ro.observe(githubTitleEl);
    window.addEventListener('resize', sync);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', sync);
    };
  });
  $effect(() => {
    if (!footerEl) return;
    const sync = () => {
      const h = footerEl!.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--opus-footer-h', `${h}px`);
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(footerEl);
    window.addEventListener('resize', sync);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', sync);
    };
  });
  $effect(() => {
    if (!postersSectionEl) return;
    const sync = () => {
      const h = postersSectionEl!.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--opus-posters-h', `${h}px`);
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(postersSectionEl);
    window.addEventListener('resize', sync);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', sync);
    };
  });

  $effect(() => {
    if (selectedPoster !== null) {
      const prevBody = document.body.style.overflow;
      const prevHtml = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevBody;
        document.documentElement.style.overflow = prevHtml;
      };
    }
  });
</script>

<div class="opus-canvas">
  <div class="opus-grid">
    <div class="opus-col opus-col--1">
      <OpusNav active="opus" />
    </div>
    <div class="opus-col opus-col--2" aria-hidden="true">
      <div class="opus-col__section opus-col__section--01">
        <span class="opus-col__index">01</span>
      </div>
      <div class="opus-col__section opus-col__section--02">
        <span class="opus-col__index">02</span>
      </div>
      <div class="opus-col__section opus-col__section--03">
        <span class="opus-col__index">03</span>
      </div>
      <div class="opus-col__section opus-col__section--04">
        <span class="opus-col__index">04</span>
      </div>
      <div class="opus-col__section opus-col__section--05">
        <span class="opus-col__index">05</span>
      </div>
      <div class="opus-col__section opus-col__section--06">
        <span class="opus-col__index">06</span>
      </div>
      <div
        class="opus-col__section opus-col__section--07"
        aria-hidden="true"
      ></div>
    </div>
    <div class="opus-col opus-col--3">
      <div
        class="opus-col__border opus-col__border--right"
        aria-hidden="true"
      ></div>
      <div class="opus-section opus-section--intro" bind:this={introEl}>
        <div class="opus-profile">
          <img
            src={ike}
            alt="Profile"
            width="256"
            height="256"
            loading="eager"
            decoding="async"
          />
        </div>
        <p class="opus-name">Ike Andrie Rosacay</p>
        <p class="opus-desc">
          Designer &amp; Developer based in <span class="opus-desc__hl"
            >Caloocan,</span
          >
          <span class="opus-desc__hl">Philippines</span>. Freelancing
          <span class="opus-desc__hl">since 2025</span>, working across
          <span class="opus-desc__hl">design</span>,
          <span class="opus-desc__hl">products</span>,
          <span class="opus-desc__hl">development</span>, and
          <span class="opus-desc__hl">creative</span> projects.
        </p>
      </div>
      <div
        class="opus-section opus-section--posters"
        bind:this={postersSectionEl}
      >
        <div
          class="opus-posters-viewport"
          bind:this={viewportEl}
          role="region"
          aria-label="Posters"
        >
          <div
            class="opus-posters"
            class:opus-posters--dragging={dragging}
            bind:this={trackEl}
            style:transform={nativeSwipe ? 'none' : `translateX(${-pos}px)`}
          >
            {#each posters as src, i (src)}
              <div class="opus-poster-wrap">
                <div
                  class="opus-poster"
                  role="button"
                  tabindex="0"
                  onclick={() => openPoster(i)}
                  onkeydown={e => e.key === 'Enter' && (selectedPoster = i)}
                >
                  <img
                    {src}
                    alt={`Poster ${i + 1}`}
                    width="2848"
                    height="3690"
                    loading="eager"
                    decoding="async"
                    draggable="false"
                  />
                </div>
                <span class="opus-poster__fig">Fig 0{i + 1}</span>
              </div>
            {/each}
          </div>
        </div>
        <div class="opus-controls">
          <div class="opus-paper-meta">
            <span class="opus-paper-quote-line" aria-hidden="true"></span>
            <span class="opus-paper-label">Loved by the team at</span>
            <a
              class="opus-paper-link"
              href="https://paper.design/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Paper"
            >
              <svg
                class="opus-paper-design"
                width="110"
                height="30"
                viewBox="0 0 110 30"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <g clip-path="url(#clipPaperDesign)">
                  <path
                    class="paper-wordmark"
                    d="M34.9844 23.975V2.97656H42.3338C46.6235 2.97656 49.4433 5.52637 49.4433 9.39608C49.4433 13.2658 46.6235 15.8156 42.3338 15.8156H38.4041V23.975H34.9844ZM38.4041 12.6959H42.3338C44.6137 12.6959 45.9636 11.436 45.9636 9.39608C45.9636 7.35623 44.6137 6.12633 42.3338 6.12633H38.4041V12.6959ZM49.291 16.6255C49.291 21.1551 52.1408 24.3049 56.2205 24.3049C58.3503 24.3049 60.2102 23.315 61.1101 21.7551V23.9749H64.3799V9.24598H61.1101V11.3159C60.3002 9.90594 58.3503 8.91601 56.2205 8.91601C52.1408 8.91601 49.291 12.0658 49.291 16.6255ZM56.8804 21.3351C54.3606 21.3351 52.5608 19.3853 52.5608 16.6255C52.5608 13.8657 54.3606 11.8858 56.8804 11.8858C59.4303 11.8858 61.2301 13.8357 61.2301 16.6255C61.2301 19.3853 59.4303 21.3351 56.8804 21.3351ZM67.0544 29.9745V9.24598H70.2942V11.4958C71.1641 9.93593 73.054 8.91601 75.2138 8.91601C79.2935 8.91601 82.1433 12.0658 82.1433 16.5955C82.1433 21.1551 79.2935 24.3049 75.2138 24.3049C73.084 24.3049 71.1341 23.315 70.2942 21.8751V29.9745H67.0544ZM70.2042 16.5955C70.2042 19.3853 71.974 21.3351 74.5238 21.3351C77.0737 21.3351 78.8435 19.3553 78.8435 16.5955C78.8435 13.8357 77.0737 11.8858 74.5238 11.8858C72.004 11.8858 70.2042 13.8357 70.2042 16.5955ZM83.4088 16.6255C83.4088 21.0651 86.5286 24.3049 90.9383 24.3049C94.137 24.3049 96.9186 22.428 97.769 19.6243H94.4226C93.6817 20.7667 92.403 21.4551 90.9383 21.4551C88.6284 21.4551 86.9785 19.9252 86.6786 17.4954H97.7178C97.7778 17.2254 97.8077 16.8655 97.8077 16.3555C97.8077 11.7658 95.1379 8.91601 90.8783 8.91601C86.5586 8.91601 83.4088 12.1258 83.4088 16.6255ZM94.628 15.0956H86.7986C87.3085 13.0557 88.8384 11.7358 90.8783 11.7358C93.0081 11.7358 94.358 12.9957 94.628 15.0956ZM100.072 9.24598V23.9749H103.312V16.4455C103.312 13.6257 104.692 12.0958 107.331 12.0958C108.171 12.0958 108.951 12.2458 109.551 12.3958V9.24598C109.011 9.036 108.291 8.91601 107.541 8.91601C105.622 8.91601 104.122 9.90594 103.312 11.7358V9.24598H100.072Z"
                  />
                  <path
                    d="M4 0H26V16H16V4H4V0ZM0 4H4V16H16V26H0V4Z"
                    fill="#81ACEC"
                  />
                </g>
                <defs>
                  <clipPath id="clipPaperDesign">
                    <rect width="110" height="30" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </a>
          </div>
          <div class="opus-controls__group">
            <button
              class="opus-ctrl"
              onclick={() => nudge(-1)}
              disabled={atStart}
              aria-label="Previous poster"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M10 12L6 8L10 4"
                  stroke="currentColor"
                  stroke-width="1.4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
            <button
              class="opus-ctrl"
              onclick={() => nudge(1)}
              disabled={atEnd}
              aria-label="Next poster"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M6 4L10 8L6 12"
                  stroke="currentColor"
                  stroke-width="1.4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div class="opus-section opus-section--works">
        <h2 class="opus-works">Works</h2>
        <div class="opus-works-list">
          {#each displayWorks as work (work.slug)}
            <WorkCard {work} from={resolve('/')} />
          {/each}
        </div>
        {#if displayWorks.length === 0 && (data.sanityError ?? false)}
          <p class="opus-desc">
            Works are unavailable right now — check back soon.
          </p>
        {/if}
        <div class="opus-more">
          <a class="opus-more__btn" href={resolve('/works')}>
            <span>See more</span>
          </a>
        </div>
      </div>
      <div class="opus-section opus-section--values" bind:this={valuesEl}>
        <p class="opus-name" bind:this={valuesTitleEl}>Values</p>
        <p class="opus-desc">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat.
        </p>
        <div class="opus-values__cols">
          <div class="opus-values__col opus-values__col--wide">
            <p class="opus-values__label">Capabilities</p>
            <ul class="opus-values__list">
              <li class="opus-values__item">Lorem ipsum dolor sit amet</li>
              <li class="opus-values__item">Consectetur adipiscing elit</li>
              <li class="opus-values__item">
                Sed do eiusmod tempor incididunt
              </li>
              <li class="opus-values__item">Ut labore et dolore magna</li>
            </ul>
          </div>
          <div class="opus-values__col">
            <p class="opus-values__label">Elsewhere</p>
            <ul class="opus-values__list">
              <li class="opus-values__item">Ut enim ad minim veniam</li>
              <li class="opus-values__item">Quis nostrud exercitation</li>
              <li class="opus-values__item">Ullamco laboris nisi aliquip</li>
            </ul>
          </div>
        </div>
        <div class="opus-values__quote">
          <span class="opus-values__quote-line" aria-hidden="true"></span>
          <div class="opus-values__quote-body">
            <p class="opus-values__quote-text">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
            <span class="opus-values__quote-by">Lorem ipsum dolor</span>
          </div>
        </div>
      </div>
      <OpusGithub bind:ref={githubEl} bind:titleRef={githubTitleEl} />
      <OpusFooter bind:ref={footerEl} />
    </div>
    <div class="opus-col opus-col--4" aria-hidden="true"></div>
    <div class="opus-col opus-col--5" aria-hidden="true"></div>
  </div>
  {#if uiState.gridOverlay}
    <div class="opus-grid opus-grid--overlay" aria-hidden="true">
      <div class="opus-col opus-col--1"></div>
      <div class="opus-col opus-col--2"></div>
      <div class="opus-col opus-col--3"></div>
      <div class="opus-col opus-col--4"></div>
      <div class="opus-col opus-col--5"></div>
    </div>
  {/if}
  <div class="opus-stripe opus-stripe--top" aria-hidden="true"></div>
  <div class="opus-stripe opus-stripe--bottom" aria-hidden="true"></div>
</div>

{#if selectedPoster !== null}
  <PosterOverlay bind:selected={selectedPoster} images={posters} />
{/if}

<style>
  :global(html) {
    height: auto;
    overflow: auto;
  }

  :global(body) {
    height: auto;
    min-height: 100vh;
    overflow: visible;
  }

  .opus-canvas {
    align-items: start;
    background: var(--color-bg-opus);
    display: grid;
    justify-items: center;
    min-height: 100dvh;
    overflow: visible;
    position: relative;
    width: 100%;
  }

  .opus-grid {
    box-sizing: border-box;
    display: grid;
    gap: 0;
    grid-template-columns: 14rem 4rem 36rem 12rem 8rem;
    justify-content: center;
    min-height: calc(100dvh + 16rem);
    width: fit-content;
  }

  .opus-grid--overlay {
    box-sizing: border-box;
    height: 100dvh;
    inset: 0;
    margin: auto;
    pointer-events: none;
    position: absolute;
    z-index: 2;
  }

  .opus-stripe {
    height: 24px;
    left: 0;
    pointer-events: none;
    position: absolute;
    right: 0;
    z-index: 1;
  }

  .opus-stripe::before {
    background-color: var(--color-overlay-05);
    content: '';
    inset: 0;
    mask-image: url('$lib/assets/stripe.svg');
    mask-repeat: repeat;
    mask-size: 7px 7px;
    pointer-events: none;
    position: absolute;
  }

  .opus-stripe--top {
    border-bottom: 1px solid var(--color-overlay-05);
    top: 0;
  }

  .opus-stripe--bottom {
    border-top: 1px solid var(--color-overlay-05);
    bottom: 0;
  }

  .opus-col {
    box-sizing: border-box;
    min-height: 100%;
    padding: 4.5rem 0 7rem;
    position: relative;
  }

  .opus-grid:not(.opus-grid--overlay) {
    border-right: 2px solid var(--color-overlay-02);
    position: relative;
  }

  .opus-grid:not(.opus-grid--overlay) .opus-col {
    border-left: 2px solid var(--color-overlay-02);
  }

  .opus-grid:not(.opus-grid--overlay) .opus-col::after {
    background: var(--color-overlay-10);
    content: '';
    height: 24px;
    left: -2px;
    pointer-events: none;
    position: absolute;
    top: 0;
    width: 2px;
    z-index: 0;
  }

  .opus-grid:not(.opus-grid--overlay) .opus-col::before {
    background: var(--color-overlay-10);
    bottom: 0;
    content: '';
    height: 24px;
    left: -2px;
    pointer-events: none;
    position: absolute;
    width: 2px;
    z-index: 0;
  }

  .opus-grid:not(.opus-grid--overlay)::after {
    background: var(--color-overlay-10);
    content: '';
    height: 24px;
    pointer-events: none;
    position: absolute;
    right: -2px;
    top: 0;
    width: 2px;
  }

  .opus-grid:not(.opus-grid--overlay)::before {
    background: var(--color-overlay-10);
    bottom: 0;
    content: '';
    height: 24px;
    pointer-events: none;
    position: absolute;
    right: -2px;
    width: 2px;
  }

  .opus-grid:not(.opus-grid--overlay) .opus-col--3 {
    align-items: stretch;
    border-left: 2px solid transparent;
    border-image: linear-gradient(
        to bottom,
        var(--color-overlay-02) 0%,
        var(--color-overlay-02) 5%,
        transparent 30%,
        transparent 60%,
        var(--color-overlay-02) 80%,
        var(--color-overlay-02) 100%
      )
      1;
    border-right: none;
    display: flex;
    flex-direction: column;
    gap: 0;
    justify-content: flex-start;
    position: relative;
    z-index: 1;
  }

  .opus-col__border--right {
    background: linear-gradient(
      to bottom,
      var(--color-overlay-02) 0%,
      var(--color-overlay-02) 20%,
      transparent 30%,
      transparent 60%,
      var(--color-overlay-02) 80%,
      var(--color-overlay-02) 100%
    );
    bottom: 0;
    pointer-events: none;
    position: absolute;
    right: -2px;
    top: 0;
    width: 2px;
    z-index: 0;
  }

  .opus-col__border--right::before {
    background: var(--color-overlay-10);
    bottom: 0;
    content: '';
    height: 24px;
    position: absolute;
    width: 2px;
  }

  .opus-col__border--right::after {
    background: var(--color-overlay-10);
    content: '';
    height: 24px;
    position: absolute;
    top: 0;
    width: 2px;
  }

  .opus-grid:not(.opus-grid--overlay) .opus-col--4 {
    border-left: none;
    pointer-events: none;
    position: relative;
    z-index: 0;
  }

  .opus-grid:not(.opus-grid--overlay) .opus-col--4::after,
  .opus-grid:not(.opus-grid--overlay) .opus-col--4::before {
    display: none;
  }

  .opus-grid:not(.opus-grid--overlay) .opus-col--5 {
    border-image: linear-gradient(
        to bottom,
        var(--color-overlay-02) 0%,
        var(--color-overlay-02) 20%,
        transparent 30%,
        transparent 60%,
        var(--color-overlay-02) 80%,
        var(--color-overlay-02) 100%
      )
      1;
    border-left: 2px solid transparent;
    pointer-events: none;
    position: relative;
    z-index: 0;
  }

  .opus-section {
    position: relative;
    z-index: 1;
  }

  .opus-col__section {
    position: relative;
    z-index: 1;
  }

  .opus-col--1 {
    align-items: stretch;
  }

  .opus-col--2 {
    align-items: stretch;
    display: flex;
    flex-direction: column;
    gap: 0;
    justify-content: flex-start;
  }

  .opus-col__section {
    align-items: flex-start;
    display: flex;
  }

  .opus-col__section--01 {
    height: var(--opus-intro-h, 13.2rem);
  }

  .opus-col__section--02 {
    height: var(--opus-posters-h, auto);
  }

  .opus-col__section--03 {
    align-items: flex-start;
    display: flex;
    flex: 1;
    margin-top: 4rem;
  }

  .opus-col__section--04 {
    align-items: flex-start;
    display: flex;
    margin-top: 1.5rem;
    min-height: 2rem;
  }

  .opus-col__section--05 {
    align-items: flex-start;
    display: flex;
    height: var(--opus-values-title-h, 1.46rem);
    margin-top: 5rem;
  }

  .opus-col__section--06 {
    height: var(--opus-github-title-h, 1.46rem);
    margin-top: calc(
      var(--opus-values-h, 7.5rem) - var(--opus-values-title-h, 1.46rem) + 5rem
    );
  }

  .opus-col__section--07 {
    height: calc(
      var(--opus-github-h, 7.5rem) - var(--opus-github-title-h, 1.46rem) +
        8rem + var(--opus-footer-h, 1.4rem)
    );
  }

  .opus-col__index {
    color: var(--color-text-faint-opus);
    font-family: 'Geist Mono', monospace;
    font-size: 0.72rem;
    font-weight: 400;
    letter-spacing: 0.04em;
    line-height: 1;
  }

  .opus-section--intro {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    height: var(--opus-intro-h, 13.2rem);
    justify-content: flex-start;
  }

  .opus-section--posters {
    display: flex;
    flex-direction: column;
    gap: 1.1rem;
  }

  .opus-section--works {
    display: flex;
    flex-direction: column;
    margin-top: 4rem;
    width: calc(100% + 20rem + 4px);
  }

  .opus-section--values {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    justify-content: flex-start;
    margin-top: 5rem;
  }

  .opus-values__cols {
    display: grid;
    gap: 1rem;
    grid-template-columns: 1.4fr 1fr;
    margin-top: 1.5rem;
    width: 100%;
  }

  .opus-values__col {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .opus-values__label {
    color: var(--color-text-faint-opus);
    font-family: 'Geist Mono', monospace;
    font-size: 0.8rem;
    font-weight: 400;
    letter-spacing: 0.04em;
    line-height: 1;
    margin: 0;
  }

  .opus-values__list {
    display: flex;
    flex-direction: column;
    gap: 0.05rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .opus-values__item {
    color: var(--color-text-muted-opus);
    font-family: Geist, sans-serif;
    font-size: 1.08rem;
    font-weight: 400;
    letter-spacing: 0.18%;
    line-height: 1.48;
    margin: 0;
  }

  .opus-values__quote {
    align-items: stretch;
    display: flex;
    gap: 0.5rem;
    margin-top: 2rem;
  }

  .opus-values__quote-line {
    background: var(--color-text);
    display: block;
    flex-shrink: 0;
    margin-right: 0.25rem;
    width: 2px;
  }

  .opus-values__quote-body {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .opus-values__quote-text {
    color: var(--color-text);
    font-family: Geist, sans-serif;
    font-size: 1.08rem;
    font-weight: 500;
    letter-spacing: 0.18%;
    line-height: 1.48;
    margin: 0;
  }

  .opus-values__quote-by {
    color: var(--color-text-muted-opus);
    font-family: Geist, sans-serif;
    font-size: 0.92rem;
    font-weight: 500;
    letter-spacing: 0.18%;
    line-height: 1.5;
  }

  .opus-works {
    color: var(--color-text);
    font-family: Geist, sans-serif;
    font-size: 1.46rem;
    font-weight: 500;
    letter-spacing: 0.1%;
    line-height: 1;
    margin: 0;
  }

  .opus-works-list {
    display: flex;
    flex-direction: column;
    gap: 3rem;
    margin-top: 1.5rem;
  }

  .opus-more {
    display: flex;
    margin-top: 3rem;
  }

  .opus-more__btn {
    align-items: center;
    background: var(--color-text);
    border: none;
    border-radius: 0;
    color: var(--color-bg);
    cursor: pointer;
    display: inline-flex;
    font-family: Geist, sans-serif;
    font-size: 1.08rem;
    font-weight: 500;
    letter-spacing: 0.18%;
    line-height: 1.15;
    min-height: 2rem;
    padding: 0.15rem 0.6rem;
    text-decoration: none;
    transition:
      background 0.25s ease,
      color 0.25s ease;
  }

  .opus-more__btn:hover {
    background: var(--color-text-muted);
    color: var(--color-bg);
  }

  .opus-profile {
    aspect-ratio: 1 / 1;
    border-radius: 0.7rem;
    max-width: 3.4rem;
    overflow: hidden;
    width: 28%;
  }

  .opus-profile img {
    display: block;
    height: 100%;
    object-fit: cover;
    width: 100%;
  }

  .opus-name {
    color: var(--color-text);
    font-family: Geist, sans-serif;
    font-size: 1.46rem;
    font-weight: 500;
    letter-spacing: 0.1%;
    line-height: 1;
    margin: 0;
  }

  .opus-desc {
    color: var(--color-text-muted-opus);
    font-family: Geist, sans-serif;
    font-size: 1.08rem;
    font-weight: 400;
    letter-spacing: 0.18%;
    line-height: 1.48;
    margin: -0.2rem 0 0;
    max-width: 92%;
  }

  .opus-desc__hl {
    color: var(--color-text);
    font-weight: 500;
  }

  .opus-posters-viewport {
    cursor: default;
    overflow: hidden;
    overscroll-behavior: contain;
    position: relative;
    touch-action: pan-y;
    user-select: none;
    width: calc(100% + 12rem + 2px);
  }

  .opus-posters {
    display: flex;
    gap: 0.7rem;
    transition: transform 0.72s cubic-bezier(0.25, 1, 0.5, 1);
    will-change: transform;
  }

  .opus-posters--dragging {
    transition: none;
  }

  .opus-poster-wrap {
    display: flex;
    flex: 0 0 calc((36rem - 0.7rem) / 2);
    flex-direction: column;
    gap: 0.45rem;
  }

  .opus-poster {
    aspect-ratio: 2848 / 3690;
    background: var(--color-overlay-03);
    cursor: pointer;
    overflow: hidden;
    position: relative;
    transition: filter 0.35s cubic-bezier(0.22, 1, 0.36, 1);
    width: 100%;
  }

  .opus-poster::after {
    background-image:
      linear-gradient(var(--color-border-corner), var(--color-border-corner)),
      linear-gradient(var(--color-border-corner), var(--color-border-corner)),
      linear-gradient(var(--color-border-corner), var(--color-border-corner)),
      linear-gradient(var(--color-border-corner), var(--color-border-corner));
    background-position:
      0 0,
      100% 0,
      0 100%,
      100% 100%;
    background-repeat: no-repeat;
    background-size: 3px 10px;
    content: '';
    inset: 0;
    opacity: 0;
    pointer-events: none;
    position: absolute;
    transition: opacity 0.15s ease;
  }

  .opus-poster:hover::after,
  .opus-poster:focus-visible::after {
    opacity: 1;
  }

  .opus-poster__fig {
    color: var(--color-text-faint-opus);
    font-family: 'Geist Mono', monospace;
    font-size: 0.72rem;
    font-weight: 400;
    letter-spacing: 0.04em;
    line-height: 1;
  }

  /* root Poster.svelte: 0xffffff → 0x888888 (0.533) via gsap 0.4s power2.out — reduced slightly */
  .opus-posters:has(.opus-poster:hover) .opus-poster:not(:hover) {
    filter: brightness(0.64);
  }

  .opus-poster:focus-visible {
    outline: 1px solid var(--color-border-solid);
    outline-offset: 2px;
  }

  .opus-posters-viewport:active {
    cursor: grabbing;
  }

  .opus-controls {
    align-items: flex-start;
    display: flex;
    justify-content: space-between;
    width: calc(100% + 12rem + 2px);
  }

  .opus-paper-meta {
    align-items: center;
    display: flex;
    gap: 0.5rem;
  }

  .opus-paper-meta .opus-paper-quote-line {
    margin-right: 0.25rem;
  }

  .opus-paper-quote-line {
    background: var(--color-text);
    display: block;
    height: 2rem;
    width: 2px;
  }

  .opus-paper-label {
    color: var(--color-text);
    font-family: Geist, sans-serif;
    font-size: 1.08rem;
    font-weight: 500;
    letter-spacing: 0.18%;
    line-height: 1;
  }

  .opus-paper-design {
    display: block;
    height: 22px;
    width: auto;
  }

  .opus-paper-link {
    display: inline-flex;
  }

  .paper-wordmark {
    fill: #3f3f3f;
  }

  :global([data-theme='dark']) .paper-wordmark {
    fill: #efefe4;
  }

  .opus-controls__group {
    display: flex;
    gap: 0.5rem;
  }

  .opus-ctrl {
    align-items: center;
    background: var(--color-overlay-05);
    border: none;
    border-radius: 0;
    color: var(--color-text);
    cursor: pointer;
    display: flex;
    justify-content: center;
    min-height: 2rem;
    min-width: 2rem;
    opacity: 0.9;
    padding: 0.45rem;
    pointer-events: auto;
    position: relative;
    transition:
      background 0.25s ease,
      color 0.25s ease,
      opacity 0.25s ease;
    z-index: 5;
  }

  .opus-ctrl:hover:not(:disabled) {
    background: var(--color-text);
    color: var(--color-bg);
    opacity: 1;
  }

  .opus-ctrl:disabled {
    opacity: 0.35;
    pointer-events: none;
  }

  .opus-poster img {
    display: block;
    height: 100%;
    object-fit: cover;
    width: 100%;
  }

  /* debug grid — Shift+G — background only */
  .opus-grid--overlay .opus-col--1 {
    background: color-mix(in srgb, var(--color-text) 5%, transparent);
  }

  .opus-grid--overlay .opus-col--2 {
    background: color-mix(in srgb, var(--color-text) 8%, transparent);
  }

  .opus-grid--overlay .opus-col--3 {
    background: color-mix(in srgb, var(--color-text) 11%, transparent);
  }

  .opus-grid--overlay .opus-col--4 {
    background: color-mix(in srgb, var(--color-text) 14%, transparent);
  }

  .opus-grid--overlay .opus-col--5 {
    background: color-mix(in srgb, var(--color-text) 17%, transparent);
  }

  /* touch: press states replace hover states, posters become a native
    swipe scroller (see nativeSwipe in the script) */
  @media (hover: none) {
    .opus-posters-viewport {
      overflow-x: auto;
      overflow-y: hidden;
      overscroll-behavior-x: contain;
      overscroll-behavior-y: auto;
      scrollbar-width: none;
      /* no CSS snap: the settle glide in the script owns card alignment so
        small swipes step forward instead of sticking between cards. */
      touch-action: pan-x pan-y;
    }

    .opus-posters-viewport::-webkit-scrollbar {
      display: none;
    }

    .opus-more__btn:hover {
      background: var(--color-text);
      color: var(--color-bg);
    }

    .opus-more__btn:active {
      background: var(--color-text-muted);
      color: var(--color-bg);
    }

    .opus-poster:hover::after {
      opacity: 0;
    }

    .opus-poster:active::after {
      opacity: 1;
    }

    .opus-posters:has(.opus-poster:hover) .opus-poster:not(:hover) {
      filter: none;
    }

    .opus-ctrl:hover:not(:disabled) {
      background: var(--color-overlay-05);
      color: var(--color-text);
      opacity: 0.9;
    }

    .opus-ctrl:active:not(:disabled) {
      background: var(--color-text);
      color: var(--color-bg);
      opacity: 1;
    }
  }
</style>
