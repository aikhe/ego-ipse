<div class="grid-background section-container">
  {#each Array.from(Array(12).keys()) as i (i)}
    <div class="bg-grid-column"></div>
  {/each}
</div>

<style>
  .grid-background {
    display: grid;
    gap: 1.2rem;
    grid-template-columns: repeat(12, 1fr);
    inset: 0;
    margin-inline: auto;
    pointer-events: none;
    position: absolute;
    z-index: -99;
  }

  .bg-grid-column {
    position: relative;
  }

  .bg-grid-column:is(
    :nth-child(1),
    :nth-child(2),
    :nth-child(4),
    :nth-child(7),
    :nth-child(10)
  ) {
    border-left: 1px dashed var(--color-overlay-15);
  }

  .bg-grid-column:nth-child(9) {
    border-right: 1px dashed var(--color-overlay-15);
  }

  .bg-grid-column:last-child {
    border-right: 1px dashed var(--color-overlay-15);
  }

  .bg-grid-column:is(
    :nth-child(1),
    :nth-child(2),
    :nth-child(4),
    :nth-child(7),
    :nth-child(10)
  )::after {
    background: var(--color-overlay-20);
    content: '';
    height: 10px;
    left: -1.5px;
    pointer-events: none;
    position: absolute;
    top: 4px;
    width: 2px;
  }

  .bg-grid-column:nth-child(9)::after,
  .bg-grid-column:last-child::after {
    background: var(--color-overlay-20);
    content: '';
    height: 10px;
    pointer-events: none;
    position: absolute;
    right: -1.5px;
    top: 4px;
    width: 2px;
  }

  .bg-grid-column:is(
    :nth-child(1),
    :nth-child(2),
    :nth-child(4),
    :nth-child(7),
    :nth-child(10)
  )::before {
    background: var(--color-overlay-20);
    bottom: 4px;
    content: '';
    height: 10px;
    left: -1.5px;
    pointer-events: none;
    position: absolute;
    width: 2px;
  }

  .bg-grid-column:nth-child(9)::before,
  .bg-grid-column:last-child::before {
    background: var(--color-overlay-20);
    bottom: 4px;
    content: '';
    height: 10px;
    pointer-events: none;
    position: absolute;
    right: -1.5px;
    width: 2px;
  }
</style>
