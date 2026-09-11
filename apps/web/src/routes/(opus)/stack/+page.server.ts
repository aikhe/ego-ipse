import type { PageServerLoad } from './$types';
import type { SanityOpusStack } from '$lib/types/sanity';

export const prerender = false;

// Same-origin API (see src/routes/api/opus-stack): Sanity is fetched
// server-side so phones never need to reach api.sanity.io directly.
export const load: PageServerLoad = async ({ fetch }) => {
  try {
    const res = await fetch('/api/opus-stack');
    if (!res.ok) return { sanityStack: null as SanityOpusStack | null };
    const data = (await res.json()) as {
      sanityStack?: SanityOpusStack | null;
    };
    return { sanityStack: data.sanityStack ?? null };
  } catch {
    return { sanityStack: null as SanityOpusStack | null };
  }
};
