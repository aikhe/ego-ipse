import { json } from '@sveltejs/kit';
import { fetchSanityOpusStack } from '$lib/sanity/opusStack';
import type { RequestHandler } from './$types';

export const prerender = false;

// Same-origin proxy like opus-about: keeps Sanity server-side so mobile
// content-blockers never need to reach api.sanity.io directly.
export const GET: RequestHandler = async () => {
  const stack = await fetchSanityOpusStack();
  // null means the sanity fetch failed: keep the outage uncacheable.
  return json(
    { sanityStack: stack },
    {
      headers: {
        'Cache-Control':
          stack !== null
            ? 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400'
            : 'no-store',
      },
    }
  );
};
