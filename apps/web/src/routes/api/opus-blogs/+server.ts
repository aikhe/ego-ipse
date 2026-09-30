import { json } from '@sveltejs/kit';
import { fetchSanityOpusBlogs } from '$lib/sanity/opusBlogs';
import type { RequestHandler } from './$types';

export const prerender = false;

// Same-origin proxy like opus-services: keeps Sanity server-side so mobile
// content-blockers never need to reach api.sanity.io directly.
export const GET: RequestHandler = async () => {
  const blogs = await fetchSanityOpusBlogs();
  // null means the sanity fetch failed: keep the outage uncacheable.
  return json(
    { sanityBlogs: blogs },
    {
      headers: {
        'Cache-Control':
          blogs !== null
            ? 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400'
            : 'no-store',
      },
    }
  );
};
