import { getJson } from '$lib/server/getJson';
import type {
  SanityOpusDescription,
  SanityOpusValues,
} from '$lib/types/sanity';
import type { PageServerLoad } from './$types';

// Same-origin APIs (see src/routes/api/opus-*): Sanity is fetched
// server-side so phones never need to reach api.sanity.io directly.
// each request settles on its own: one failing section never blanks the other.
export const load: PageServerLoad = async ({ fetch }) => {
  const [valuesData, aboutData] = await Promise.all([
    getJson<{ sanityValues?: SanityOpusValues | null }>(
      fetch,
      '/api/opus-values'
    ),
    getJson<{ sanityAbout?: SanityOpusDescription | null }>(
      fetch,
      '/api/opus-about'
    ),
  ]);
  return {
    sanityValues: valuesData?.sanityValues ?? null,
    sanityAbout: aboutData?.sanityAbout ?? null,
  };
};
