<div class="stripe-gutter-outer stripe-gutter-outer--left"></div>
<div class="stripe-gutter-outer stripe-gutter-outer--right"></div>

<style>
  .stripe-gutter-outer {
    background-color: var(--color-overlay-10);
    bottom: 0;
    mask-image: url('$lib/assets/stripe.svg');
    mask-repeat: repeat;
    mask-size: 7px 7px;
    pointer-events: none;
    position: fixed;
    top: 0;
    width: max(0px, var(--page-stage-offset-x, 0px));
    z-index: 1;
  }

  .stripe-gutter-outer--left {
    left: 0;
  }

  .stripe-gutter-outer--right {
    right: 0;
  }
</style>
