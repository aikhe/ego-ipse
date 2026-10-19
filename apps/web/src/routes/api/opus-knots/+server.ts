import { json } from '@sveltejs/kit';
import { fetchSanityOpusKnots } from '$lib/sanity/opusKnots';
import type { RequestHandler } from './$types';

export const prerender = false;

// Same-origin proxy like opus-osn: keeps Sanity server-side so mobile
// content-blockers never need to reach api.sanity.io directly.
export const GET: RequestHandler = async () => {
  const knots = await fetchSanityOpusKnots();
  // null means the sanity fetch failed: keep the outage uncacheable.
  return json(
    { sanityKnots: knots },
    {
      headers: {
        'Cache-Control':
          knots !== null
            ? 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400'
            : 'no-store',
      },
    }
  );
};
