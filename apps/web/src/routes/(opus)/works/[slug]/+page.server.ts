import { error } from '@sveltejs/kit';
import { getJson } from '$lib/server/getJson';
import { opusWorksApiPath } from '$lib/sanity/opusWorks';
import type { Work } from '$lib/types/work';
import type { PageServerLoad } from './$types';

// Dynamic SSR, resolved live per request: same-origin API (Sanity
// server-side, so slug changes need no rebuild).
export const load: PageServerLoad = async ({ params, fetch }) => {
  const data = await getJson<{ work?: Work | null }>(
    fetch,
    opusWorksApiPath(params.slug)
  );
  if (!data?.work) error(404, 'Work not found');
  return { work: data.work };
};
