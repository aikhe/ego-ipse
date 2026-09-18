import { json } from '@sveltejs/kit';
import { fetchSanityOpusServices } from '$lib/sanity/opusServices';
import type { RequestHandler } from './$types';

export const prerender = false;

// Same-origin proxy like opus-nvim: keeps Sanity server-side so mobile
// content-blockers never need to reach api.sanity.io directly.
export const GET: RequestHandler = async () => {
  const services = await fetchSanityOpusServices();
  // null means the sanity fetch failed: keep the outage uncacheable.
  return json(
    { sanityServices: services },
    {
      headers: {
        'Cache-Control':
          services !== null
            ? 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400'
            : 'no-store',
      },
    }
  );
};
