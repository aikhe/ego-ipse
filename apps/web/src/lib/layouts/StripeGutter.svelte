<div class="stripe-gutter stripe-gutter--left"></div>
<div class="stripe-gutter stripe-gutter--right"></div>
<div class="stripe-gutter-outer stripe-gutter-outer--left"></div>
<div class="stripe-gutter-outer stripe-gutter-outer--right"></div>

<style>
  .stripe-gutter {
    background-color: var(--color-overlay-10);
    bottom: 0;
    mask-image: url('$lib/assets/stripe.svg');
    mask-repeat: repeat;
    mask-size: 7px 7px;
    pointer-events: none;
    position: absolute;
    top: 0;
    width: calc((100% - var(--container-width)) / 2);
    z-index: -999;
  }

  .stripe-gutter--left {
    left: 0;
  }

  .stripe-gutter--right {
    right: 0;
  }

  .stripe-gutter-outer {
    background-color: var(--color-overlay-10);
    bottom: 0;
    mask-image: url('$lib/assets/stripe.svg');
    mask-repeat: repeat;
    mask-size: 7px 7px;
    pointer-events: none;
    position: fixed;
    top: 0;
    width: max(
      0px,
      calc(
        (100vw - (var(--container-max-width) * var(--page-stage-scale, 1))) / 2
      )
    );
    z-index: 1;
  }

  .stripe-gutter-outer--left {
    left: 0;
  }

  .stripe-gutter-outer--right {
    right: 0;
  }
</style>
