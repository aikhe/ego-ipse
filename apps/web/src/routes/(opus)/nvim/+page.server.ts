import { getJson } from '$lib/server/getJson';
import type { SanityOpusNvim } from '$lib/types/sanity';
import type { PageServerLoad } from './$types';

// Same-origin API (see src/routes/api/opus-nvim): Sanity is fetched
// server-side so phones never need to reach api.sanity.io directly.
export const load: PageServerLoad = async ({ fetch }) => {
  const data = await getJson<{
    sanityNvim?: SanityOpusNvim | null;
    pluginStars?: Record<string, number>;
  }>(fetch, '/api/opus-nvim');
  return {
    sanityNvim: data?.sanityNvim ?? null,
    pluginStars: data?.pluginStars ?? {},
  };
};
