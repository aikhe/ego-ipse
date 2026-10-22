import { getJson } from '$lib/server/getJson';
import type { SanityOpusWorksResult } from '$lib/sanity/opusWorks';
import type { SanityOpusValues } from '$lib/types/sanity';
import type { PageServerLoad } from './$types';

// Same-origin APIs (see src/routes/api/opus-*): Sanity is fetched
// server-side so phones never need to reach api.sanity.io directly.
// each request settles on its own: one failing section never blanks the other.
export const load: PageServerLoad = async ({ fetch }) => {
  const [worksData, valuesData] = await Promise.all([
    getJson<Pick<SanityOpusWorksResult, 'sanitySelected'>>(
      fetch,
      '/api/opus-works'
    ),
    getJson<{ sanityValues?: SanityOpusValues | null }>(
      fetch,
      '/api/opus-values'
    ),
  ]);
  return {
    sanitySelected: worksData?.sanitySelected ?? [],
    sanityValues: valuesData?.sanityValues ?? null,
    sanityError: worksData === null,
  };
};
