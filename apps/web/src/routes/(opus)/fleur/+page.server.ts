import { getJson } from '$lib/server/getJson';
import type { SanityOpusFleur } from '$lib/types/sanity';
import type { PageServerLoad } from './$types';

// Same-origin API (see src/routes/api/opus-fleur): Sanity is fetched
// server-side so phones never need to reach api.sanity.io directly.
export const load: PageServerLoad = async ({ fetch }) => {
  const data = await getJson<{ sanityFleur?: SanityOpusFleur | null }>(
    fetch,
    '/api/opus-fleur'
  );
  return { sanityFleur: data?.sanityFleur ?? null };
};
