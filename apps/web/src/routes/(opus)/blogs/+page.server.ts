import { getJson } from '$lib/server/getJson';
import type { SanityOpusDescription } from '$lib/types/sanity';
import type { PageServerLoad } from './$types';

// Same-origin API (see src/routes/api/opus-blogs): Sanity is fetched
// server-side so phones never need to reach api.sanity.io directly.
export const load: PageServerLoad = async ({ fetch }) => {
  const data = await getJson<{ sanityBlogs?: SanityOpusDescription | null }>(
    fetch,
    '/api/opus-blogs'
  );
  return { sanityBlogs: data?.sanityBlogs ?? null };
};
