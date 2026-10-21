import adapter from '@sveltejs/adapter-cloudflare';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter(),
    // nonce'd inline scripts for ssr pages; style-src stays permissive for svelte/gsap inline styles
    csp: {
      mode: 'auto',
      directives: {
        'default-src': ['self'],
        'script-src': ['self'],
        'style-src': ['self', 'unsafe-inline', 'https://fonts.googleapis.com'],
        'font-src': ['self', 'data:', 'https://fonts.gstatic.com'],
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
