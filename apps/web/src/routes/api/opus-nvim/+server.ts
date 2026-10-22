import { cachedJson } from '$lib/server/edgeCache';
import { fetchSanityOpusNvim } from '$lib/sanity/opusNvim';
import type { RequestHandler } from './$types';

// Same-origin proxy like opus-about: keeps Sanity server-side so mobile
// content-blockers never need to reach api.sanity.io directly.
export const GET: RequestHandler = event =>
  cachedJson(event, async () => {
    const nvim = await fetchSanityOpusNvim();
    // null means the sanity fetch failed: keep the outage uncacheable.
    return { body: { sanityNvim: nvim }, ok: nvim !== null };
  });
