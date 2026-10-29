import adapter from '@sveltejs/adapter-cloudflare';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter(),
    // inline every route stylesheet into the ssr html: the page css is small
    // (~12kb gzip) and a chain of render-blocking requests delays first paint.
    inlineStyleThreshold: Infinity,
    // nonce'd inline scripts for ssr pages; style-src stays permissive for svelte/gsap inline styles
    csp: {
      mode: 'auto',
      directives: {
        'default-src': ['self'],
        'script-src': ['self'],
        'style-src': ['self', 'unsafe-inline'],
        'font-src': ['self'],
        'img-src': ['self', 'data:', 'blob:', 'https://cdn.sanity.io'],
        'connect-src': ['self', 'blob:', 'https://cdn.sanity.io'],
        'frame-ancestors': ['none'],
        'base-uri': ['self'],
        'form-action': ['self'],
        'object-src': ['none'],
        'upgrade-insecure-requests': true,
      },
    },
  },
};

export default config;
