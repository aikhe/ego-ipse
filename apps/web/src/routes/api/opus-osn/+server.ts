import { json } from '@sveltejs/kit';
import { fetchSanityOpusOsn } from '$lib/sanity/opusOsn';
import type { RequestHandler } from './$types';

export const prerender = false;

// Same-origin proxy like opus-fleur: keeps Sanity server-side so mobile
// content-blockers never need to reach api.sanity.io directly.
export const GET: RequestHandler = async () => {
  const osn = await fetchSanityOpusOsn();
  // null means the sanity fetch failed: keep the outage uncacheable.
  return json(
    { sanityOsn: osn },
    {
      headers: {
        'Cache-Control':
          osn !== null
            ? 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400'
            : 'no-store',
      },
    }
  );
};
