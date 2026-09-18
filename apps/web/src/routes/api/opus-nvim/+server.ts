import { json } from '@sveltejs/kit';
import { fetchSanityOpusNvim } from '$lib/sanity/opusNvim';
import type { RequestHandler } from './$types';

export const prerender = false;

// Same-origin proxy like opus-about: keeps Sanity server-side so mobile
// content-blockers never need to reach api.sanity.io directly.
export const GET: RequestHandler = async () => {
  const nvim = await fetchSanityOpusNvim();
  // null means the sanity fetch failed: keep the outage uncacheable.
  return json(
    { sanityNvim: nvim },
    {
      headers: {
        'Cache-Control':
          nvim !== null
            ? 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400'
            : 'no-store',
      },
    }
  );
};
