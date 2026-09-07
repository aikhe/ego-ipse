<script lang="ts">
  import { resolve } from '$app/paths';
  import { uiState } from '$lib/state/ui.svelte';
  import { works } from '$lib/data/works';
  import WorkCard from '$lib/components/Work/WorkCard.svelte';
</script>

<div class="opus-canvas">
  <div class="opus-grid">
    <div class="opus-col opus-col--1">
      <nav class="opus-nav" aria-label="Site sections">
        <a class="opus-nav__link" href={resolve('/opus')}>opus</a>
        <a class="opus-nav__link" href="https://aikhe.pages.dev" target="_blank" rel="noopener noreferrer">ipse</a>
        <span class="opus-nav__link opus-nav__link--active" aria-current="page">works</span>
      </nav>
    </div>
    <div class="opus-col opus-col--2" aria-hidden="true">
      <div class="opus-col__section opus-col__section--01"><span class="opus-col__index">01</span></div>
    </div>
    <div class="opus-col opus-col--3">
      <div class="opus-col__border opus-col__border--right" aria-hidden="true"></div>
      <div class="opus-section opus-section--works">
        <h2 class="opus-works">Works</h2>
        <div class="opus-works-list">
          {#each works as work, i (i)}
            <WorkCard {work} />
          {/each}
        </div>
      </div>
    </div>
    <div class="opus-col opus-col--4" aria-hidden="true"></div>
  </div>
  {#if uiState.gridOverlay}
    <div class="opus-grid opus-grid--overlay" aria-hidden="true">
      <div class="opus-col opus-col--1"></div>
      <div class="opus-col opus-col--2"></div>
      <div class="opus-col opus-col--3"></div>
      <div class="opus-col opus-col--4"></div>
    </div>
  {/if}
  <div class="opus-stripe opus-stripe--top" aria-hidden="true"></div>
  <div class="opus-stripe opus-stripe--bottom" aria-hidden="true"></div>
</div>

<style>
  :global(html) {
    height: auto;
    overflow: auto;
  }

  :global(body) {
    height: auto;
    min-height: 100vh;
    overflow: auto;
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
    grid-template-columns: 9rem 4rem 36rem 12rem;
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
    background-color: var(--color-overlay-10);
    content: '';
    inset: 0;
    mask-image: url('$lib/assets/stripe.svg');
    mask-repeat: repeat;
    mask-size: 7px 7px;
    pointer-events: none;
    position: absolute;
  }

  .opus-stripe--top {
    border-bottom: 1px solid var(--color-overlay-10);
    top: 0;
  }

  .opus-stripe--bottom {
    border-top: 1px solid var(--color-overlay-10);
    bottom: 0;
  }

  .opus-col {
    box-sizing: border-box;
    min-height: 100%;
    padding: 4.5rem 0 7rem;
    position: relative;
  }

  .opus-grid:not(.opus-grid--overlay) {
    border-right: 2px solid var(--color-overlay-03);
    position: relative;
  }

  .opus-grid:not(.opus-grid--overlay) .opus-col {
    border-left: 2px solid var(--color-overlay-03);
  }

  .opus-grid:not(.opus-grid--overlay) .opus-col::after {
    background: var(--color-overlay-15);
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
    background: var(--color-overlay-15);
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
    background: var(--color-overlay-15);
    content: '';
    height: 24px;
    pointer-events: none;
    position: absolute;
    right: -2px;
    top: 0;
    width: 2px;
  }

  .opus-grid:not(.opus-grid--overlay)::before {
    background: var(--color-overlay-15);
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
        var(--color-overlay-03) 0%,
        var(--color-overlay-03) 20%,
        transparent 30%,
        transparent 60%,
        var(--color-overlay-03) 80%,
        var(--color-overlay-03) 100%
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
        var(--color-overlay-03) 0%,
        var(--color-overlay-03) 20%,
        transparent 30%,
        transparent 60%,
        var(--color-overlay-03) 80%,
        var(--color-overlay-03) 100%
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
    background: var(--color-overlay-15);
    bottom: 0;
    content: '';
    height: 24px;
    position: absolute;
    width: 2px;
  }

  .opus-col__border--right::after {
    background: var(--color-overlay-15);
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

  .opus-nav {
    align-items: flex-start;
    display: flex;
    flex-direction: column;
    gap: 0.05rem;
    left: calc(50vw - 30.5rem);
    margin-top: -0.12rem;
    position: fixed;
    top: 4.5rem;
    z-index: 5;
  }

  .opus-nav__link {
    color: var(--color-text-muted-opus);
    font-family: Geist, sans-serif;
    font-size: 1.08rem;
    font-weight: 500;
    letter-spacing: 0.18%;
    line-height: 1.15;
    text-decoration: none;
    transition: color 0.2s ease;
  }

  .opus-nav__link--active {
    color: var(--color-text);
  }

  .opus-nav__link:not(.opus-nav__link--active):hover {
    color: var(--color-text);
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

  .opus-col__index {
    color: var(--color-text-muted-opus);
    font-family: 'Geist Mono', monospace;
    font-size: 0.72rem;
    font-weight: 400;
    letter-spacing: 0.04em;
    line-height: 1;
  }

  .opus-section--works {
    display: flex;
    flex-direction: column;
    width: calc(100% + 12rem + 2px);
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
    gap: 1.2rem;
    margin-top: 1.5rem;
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
</style>
