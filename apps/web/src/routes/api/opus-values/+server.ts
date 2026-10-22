import { cachedJson } from '$lib/server/edgeCache';
import { fetchSanityOpusValues } from '$lib/sanity/opusValues';
import type { RequestHandler } from './$types';

// Same-origin proxy like opus-works: keeps Sanity server-side so mobile
// content-blockers never need to reach api.sanity.io directly.
export const GET: RequestHandler = event =>
  cachedJson(event, async () => {
    const values = await fetchSanityOpusValues();
    // null means the sanity fetch failed: keep the outage uncacheable.
    return { body: { sanityValues: values }, ok: values !== null };
  });
