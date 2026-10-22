import { getJson } from '$lib/server/getJson';
import type { SanityOpusGallery } from '$lib/types/sanity';
import type { PageServerLoad } from './$types';

// Same-origin API (see src/routes/api/opus-osn): Sanity is fetched
// server-side so phones never need to reach api.sanity.io directly.
export const load: PageServerLoad = async ({ fetch }) => {
  const data = await getJson<{ sanityOsn?: SanityOpusGallery | null }>(
    fetch,
    '/api/opus-osn'
  );
  return { sanityOsn: data?.sanityOsn ?? null };
};
