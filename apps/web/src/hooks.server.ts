import type { Handle } from '@sveltejs/kit';
import { SECURITY_HEADERS } from '$lib/server/securityHeaders';

// pages functions responses skip static/_headers, so set them here
export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(name, value);
  }
  return response;
};
