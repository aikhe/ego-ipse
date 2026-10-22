import { getJson } from '$lib/server/getJson';
import type { SanityOpusStack } from '$lib/types/sanity';
import type { PageServerLoad } from './$types';

// Same-origin API (see src/routes/api/opus-stack): Sanity is fetched
// server-side so phones never need to reach api.sanity.io directly.
export const load: PageServerLoad = async ({ fetch }) => {
  const data = await getJson<{ sanityStack?: SanityOpusStack | null }>(
    fetch,
    '/api/opus-stack'
  );
  return { sanityStack: data?.sanityStack ?? null };
};
