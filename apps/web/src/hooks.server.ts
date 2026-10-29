import type { Handle } from '@sveltejs/kit';
import { SECURITY_HEADERS } from '$lib/server/securityHeaders';

// pages functions responses skip static/_headers, so set them here
export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(name, value);
  }

  // preserve the ssr document and its csp: cloudflare's injected analytics
  // fails with content blockers, and email obfuscation rewrites hydrated links.
  if (response.headers.get('content-type')?.startsWith('text/html')) {
    const cacheControl =
      response.headers.get('cache-control') ?? 'private, no-cache';
    response.headers.set('cache-control', `${cacheControl}, no-transform`);
  }

  return response;
};
