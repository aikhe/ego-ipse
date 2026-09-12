import { json } from '@sveltejs/kit';
import { fetchSanityOpusValues } from '$lib/sanity/opusValues';
import type { RequestHandler } from './$types';

export const prerender = false;

// Same-origin proxy like opus-works: keeps Sanity server-side so mobile
// content-blockers never need to reach api.sanity.io directly.
export const GET: RequestHandler = async () => {
  const values = await fetchSanityOpusValues();
  // null means the sanity fetch failed: keep the outage uncacheable.
  return json(
    { sanityValues: values },
    {
      headers: {
        'Cache-Control':
          values !== null
            ? 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400'
            : 'no-store',
      },
    }
  );
};
