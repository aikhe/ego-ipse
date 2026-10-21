import { cachedJson } from '$lib/server/edgeCache';
import { fetchSanityOpusAbout } from '$lib/sanity/opusAbout';
import type { RequestHandler } from './$types';

export const prerender = false;

// Same-origin proxy like opus-values: keeps Sanity server-side so mobile
// content-blockers never need to reach api.sanity.io directly.
export const GET: RequestHandler = event =>
  cachedJson(event, async () => {
    const about = await fetchSanityOpusAbout();
    // null means the sanity fetch failed: keep the outage uncacheable.
    return { body: { sanityAbout: about }, ok: about !== null };
  });
