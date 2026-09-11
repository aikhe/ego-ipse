import { json } from '@sveltejs/kit';
import { fetchSanityOpusWorkBySlug } from '$lib/sanity/opusWorks';
import type { RequestHandler } from './$types';

export const prerender = false;

// Same-origin proxy (see ../+server.ts): `{ work: null }` when Sanity has no
// doc for the slug so the page can fall back to hardcoded data.
export const GET: RequestHandler = async ({ params }) => {
  const work = await fetchSanityOpusWorkBySlug(fetch, params.slug);
  return json(
    { work },
    {
      headers: {
        'Cache-Control':
          'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
      },
    }
  );
};
