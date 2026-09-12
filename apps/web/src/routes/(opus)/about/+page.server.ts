import type { PageServerLoad } from './$types';
import type { SanityOpusAbout, SanityOpusValues } from '$lib/types/sanity';

export const prerender = false;

// Same-origin APIs (see src/routes/api/opus-*): Sanity is fetched
// server-side so phones never need to reach api.sanity.io directly.
export const load: PageServerLoad = async ({ fetch }) => {
  try {
    const [valuesRes, aboutRes] = await Promise.all([
      fetch('/api/opus-values'),
      fetch('/api/opus-about'),
    ]);
    const sanityValues = valuesRes.ok
      ? (
          (await valuesRes.json()) as {
            sanityValues?: SanityOpusValues | null;
          }
        ).sanityValues ?? null
      : null;
    const sanityAbout = aboutRes.ok
      ? (
          (await aboutRes.json()) as {
            sanityAbout?: SanityOpusAbout | null;
          }
        ).sanityAbout ?? null
      : null;
    return { sanityValues, sanityAbout };
  } catch {
    return {
      sanityValues: null as SanityOpusValues | null,
      sanityAbout: null as SanityOpusAbout | null,
    };
  }
};
