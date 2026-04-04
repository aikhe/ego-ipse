// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

declare module '*.svg';
declare module '*.svg?url';
declare module '*.png';
declare module '*.jpg';

declare global {
  namespace App {
    interface Platform {
      env: Env;
      ctx: ExecutionContext;
      caches: CacheStorage;
      cf?: IncomingRequestCfProperties;
    }
  }
}

export {};
