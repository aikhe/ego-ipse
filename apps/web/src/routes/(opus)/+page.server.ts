import type { PageServerLoad } from './$types';
import type { Work } from '$lib/data/works';
import type { SanityOpusValues } from '$lib/types/sanity';

export const prerender = false;

// Same-origin APIs (see src/routes/api/opus-*): Sanity is fetched
// server-side so phones never need to reach api.sanity.io directly.
// each request settles on its own: one failing section never blanks the other.
async function getJson<T>(fetchFn: typeof fetch, url: string): Promise<T | null> {
  try {
    const res = await fetchFn(url);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export const load: PageServerLoad = async ({ fetch }) => {
  const [worksData, valuesData] = await Promise.all([
    getJson<{ sanitySelected?: Work[] }>(fetch, '/api/opus-works'),
    getJson<{ sanityValues?: SanityOpusValues | null }>(
      fetch,
      '/api/opus-values'
    ),
  ]);
  const sanitySelected = worksData?.sanitySelected ?? [];
  return {
    sanitySelected,
    sanityValues: valuesData?.sanityValues ?? null,
    sanityError: worksData === null,
  };
};
