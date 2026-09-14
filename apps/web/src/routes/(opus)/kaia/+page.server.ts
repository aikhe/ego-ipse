import type { PageServerLoad } from './$types';
import type { SanityOpusKaia } from '$lib/types/sanity';

export const prerender = false;

// Same-origin API (see src/routes/api/opus-kaia): Sanity is fetched
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
  const kaiaData = await getJson<{ sanityKaia?: SanityOpusKaia | null }>(
    fetch,
    '/api/opus-kaia'
  );
  return {
    sanityKaia: kaiaData?.sanityKaia ?? null,
  };
};
