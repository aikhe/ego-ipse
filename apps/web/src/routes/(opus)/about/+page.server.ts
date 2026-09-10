import type { PageServerLoad } from './$types';
import type { SanityOpusAbout } from '$lib/types/sanity';

export const prerender = false;

// Same-origin API (see src/routes/api/opus-about): Sanity is fetched
// server-side so phones never need to reach api.sanity.io directly.
export const load: PageServerLoad = async ({ fetch }) => {
  try {
    const res = await fetch('/api/opus-about');
    if (!res.ok) return { sanityAbout: null as SanityOpusAbout | null };
    const data = (await res.json()) as {
      sanityAbout?: SanityOpusAbout | null;
    };
    return { sanityAbout: data.sanityAbout ?? null };
  } catch {
    return { sanityAbout: null as SanityOpusAbout | null };
  }
};
