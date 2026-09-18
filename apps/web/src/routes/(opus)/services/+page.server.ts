import type { PageServerLoad } from './$types';
import type { SanityOpusServices } from '$lib/types/sanity';

export const prerender = false;

// Same-origin API (see src/routes/api/opus-services): Sanity is fetched
// server-side so phones never need to reach api.sanity.io directly.
async function getJson<T>(
  fetchFn: typeof fetch,
  url: string
): Promise<T | null> {
  try {
    const res = await fetchFn(url);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export const load: PageServerLoad = async ({ fetch }) => {
  const servicesData = await getJson<{
    sanityServices?: SanityOpusServices | null;
  }>(fetch, '/api/opus-services');
  return {
    sanityServices: servicesData?.sanityServices ?? null,
  };
};
