import { json } from '@sveltejs/kit';
import { fetchSanityOpusKaia } from '$lib/sanity/opusKaia';
import type { RequestHandler } from './$types';

export const prerender = false;

// Same-origin proxy like opus-about: keeps Sanity server-side so mobile
// content-blockers never need to reach api.sanity.io directly.
export const GET: RequestHandler = async () => {
  const kaia = await fetchSanityOpusKaia();
  // null means the sanity fetch failed: keep the outage uncacheable.
  return json(
    { sanityKaia: kaia },
    {
      headers: {
        'Cache-Control':
          kaia !== null
            ? 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400'
            : 'no-store',
      },
    }
  );
};
