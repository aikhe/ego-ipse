import { json } from '@sveltejs/kit';
import { fetchSanityOpusWorkBySlug } from '$lib/sanity/opusWorks';
import type { RequestHandler } from './$types';

export const prerender = false;

// Same-origin proxy (see ../+server.ts): `{ work: null }` when Sanity has no
// doc for the slug so the page can fall back to hardcoded data.
export const GET: RequestHandler = async ({ params }) => {
  const work = await fetchSanityOpusWorkBySlug(fetch, params.slug);
  // null covers both missing docs and failed fetches: only cache a hit so
  // a transient outage cannot pin a real page as missing for hours.
  return json(
    { work },
    {
      headers: {
        'Cache-Control':
          work !== null
            ? 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400'
            : 'no-store',
      },
    }
  );
};
