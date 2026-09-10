import type { PageServerLoad } from './$types';
import type { Work } from '$lib/data/works';
import type { SanityOpusValues } from '$lib/types/sanity';

export const prerender = false;

// Same-origin APIs (see src/routes/api/opus-*): Sanity is fetched
// server-side so phones never need to reach api.sanity.io directly.
export const load: PageServerLoad = async ({ fetch }) => {
  try {
    const [worksRes, valuesRes] = await Promise.all([
      fetch('/api/opus-works'),
      fetch('/api/opus-values'),
    ]);
    const sanitySelected = worksRes.ok
      ? (((await worksRes.json()) as { sanitySelected?: Work[] })
          .sanitySelected ?? [])
      : [];
    const sanityValues = valuesRes.ok
      ? ((await valuesRes.json()) as { sanityValues?: SanityOpusValues | null })
          .sanityValues ?? null
      : null;
    return {
      sanitySelected,
      sanityValues,
      sanityError: !worksRes.ok,
    };
  } catch {
    return {
      sanitySelected: [] as Work[],
      sanityValues: null as SanityOpusValues | null,
      sanityError: true,
    };
  }
};
