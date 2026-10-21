// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

// pulls in the adapter's Platform typings (ctx, caches, cf) from its own workers-types
/// <reference types="@sveltejs/adapter-cloudflare" />

declare module '*.svg';
declare module '*.svg?url';
declare module '*.png';
declare module '*.jpg';

declare global {
  namespace App {
    // no bindings are configured in wrangler.jsonc
    interface Platform {
      env: Record<string, never>;
    }
  }
}

export {};
