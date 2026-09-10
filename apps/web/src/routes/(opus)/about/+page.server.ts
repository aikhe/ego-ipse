import type { PageServerLoad } from './$types';
import type { SanityOpusValues } from '$lib/types/sanity';

export const prerender = false;

// Same-origin API (see src/routes/api/opus-values): Sanity is fetched
// server-side so phones never need to reach api.sanity.io directly.
export const load: PageServerLoad = async ({ fetch }) => {
  try {
    const res = await fetch('/api/opus-values');
    if (!res.ok) return { sanityValues: null as SanityOpusValues | null };
    const data = (await res.json()) as {
      sanityValues?: SanityOpusValues | null;
    };
    return { sanityValues: data.sanityValues ?? null };
  } catch {
    return { sanityValues: null as SanityOpusValues | null };
  }
};
