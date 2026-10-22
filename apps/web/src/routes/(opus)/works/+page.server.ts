import { getJson } from '$lib/server/getJson';
import type { SanityOpusWorksResult } from '$lib/sanity/opusWorks';
import type { PageServerLoad } from './$types';

// Same-origin API (see src/routes/api/opus-works): Sanity is fetched
// server-side so phones never need to reach api.sanity.io directly.
export const load: PageServerLoad = async ({ fetch }) => {
  const data = await getJson<SanityOpusWorksResult>(fetch, '/api/opus-works');
  return {
    sanitySelected: data?.sanitySelected ?? [],
    sanityWorks: data?.sanityWorks ?? [],
    sanityError: data === null,
  };
};
