import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  server: {
    host: true
  },
  optimizeDeps: {
    include: ['three', 'gsap', '@threlte/core', '@paper-design/shaders']
  },
  build: {
    // lighthouse "minify javascript": keep esbuild minify + css minify
    // explicit so cloudflare output ships fully compressed.
    minify: 'esbuild',
    cssMinify: true,
    sourcemap: false,
    target: 'es2020',
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // three/threlte/paper-design only run on /ipse + /shaders routes:
          // isolate them so the opus homepage ships without webgl weight.
          if (id.includes('@paper-design/shaders')) return 'vendor-shaders';
          if (id.includes('@threlte/') || id.includes('three')) return 'vendor-three';
          if (id.includes('gsap')) return 'vendor-gsap';
        }
      }
    }
  },
  test: {
    expect: { requireAssertions: true },
    projects: [
      {
        extends: true,
        test: {
          name: 'client',
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: 'chromium', headless: true }],
          },
          include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
          exclude: ['src/lib/server/**'],
        },
      },

      {
        extends: true,
        test: {
          name: 'server',
          environment: 'node',
          include: ['src/**/*.{test,spec}.{js,ts}'],
          exclude: ['src/**/*.svelte.{test,spec}.{js,ts}'],
        },
      },
    ],
  },
});
