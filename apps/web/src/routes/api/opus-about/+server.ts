import { json } from '@sveltejs/kit';
import { fetchSanityOpusAbout } from '$lib/sanity/opusAbout';
import type { RequestHandler } from './$types';

export const prerender = false;

// Same-origin proxy like opus-values: keeps Sanity server-side so mobile
// content-blockers never need to reach api.sanity.io directly.
export const GET: RequestHandler = async () => {
  const about = await fetchSanityOpusAbout();
  // null means the sanity fetch failed: keep the outage uncacheable.
  return json(
    { sanityAbout: about },
    {
      headers: {
        'Cache-Control':
          about !== null
            ? 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400'
            : 'no-store',
      },
    }
  );
};
