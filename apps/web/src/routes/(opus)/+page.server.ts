import type { PageServerLoad } from './$types';
import type { Work } from '$lib/data/works';

export const prerender = false;

// Same-origin API (see src/routes/api/opus-works): Sanity is fetched
// server-side so phones never need to reach api.sanity.io directly.
export const load: PageServerLoad = async ({ fetch }) => {
  try {
    const res = await fetch('/api/opus-works');
    if (!res.ok) return { sanitySelected: [] as Work[] };
    const data = (await res.json()) as { sanitySelected?: Work[] };
    return { sanitySelected: data.sanitySelected ?? [] };
  } catch {
    return { sanitySelected: [] as Work[] };
  }
};
