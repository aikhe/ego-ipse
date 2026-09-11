import { json } from '@sveltejs/kit';
import { fetchSanityOpusWorks } from '$lib/sanity/opusWorks';
import type { RequestHandler } from './$types';

export const prerender = false;

// Same-origin proxy: browsers (especially mobile content-blockers) can fail
// calling api.sanity.io directly during client-side navigation, so all Sanity
// traffic goes through here. Sanity is always fetched server-side.
export const GET: RequestHandler = async () => {
  const result = await fetchSanityOpusWorks();
  return json(result, {
    headers: {
      'Cache-Control':
        'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
};
