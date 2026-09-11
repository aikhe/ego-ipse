import { error } from '@sveltejs/kit';
import { getWorkBySlug } from '$lib/data/works';
import type { Work } from '$lib/data/works';
import type { PageServerLoad } from './$types';

export const prerender = false;

export const load: PageServerLoad = async ({ params, fetch }) => {
  // Dynamic SSR, resolved live per request: same-origin API first (Sanity
  // server-side, so slug changes need no rebuild), hardcoded as fallback.
  try {
    const res = await fetch(`/api/opus-works/${params.slug}`);
    if (res.ok) {
      const data = (await res.json()) as { work?: Work | null };
      if (data.work) return { work: data.work };
    }
  } catch {
    // fall through to hardcoded
  }
  const work = getWorkBySlug(params.slug);
  if (!work) throw error(404, 'Work not found');
  return { work };
};
