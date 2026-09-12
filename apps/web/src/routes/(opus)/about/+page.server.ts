import type { PageServerLoad } from './$types';
import type { SanityOpusAbout, SanityOpusValues } from '$lib/types/sanity';

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
  const [valuesData, aboutData] = await Promise.all([
    getJson<{ sanityValues?: SanityOpusValues | null }>(
      fetch,
      '/api/opus-values'
    ),
    getJson<{ sanityAbout?: SanityOpusAbout | null }>(fetch, '/api/opus-about'),
  ]);
  return {
    sanityValues: valuesData?.sanityValues ?? null,
    sanityAbout: aboutData?.sanityAbout ?? null,
  };
};
