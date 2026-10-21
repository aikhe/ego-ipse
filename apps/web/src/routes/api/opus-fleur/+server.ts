import { cachedJson } from '$lib/server/edgeCache';
import { fetchSanityOpusFleur } from '$lib/sanity/opusFleur';
import type { RequestHandler } from './$types';

export const prerender = false;

// Same-origin proxy like opus-about: keeps Sanity server-side so mobile
// content-blockers never need to reach api.sanity.io directly.
export const GET: RequestHandler = event =>
  cachedJson(event, async () => {
    const fleur = await fetchSanityOpusFleur();
    // null means the sanity fetch failed: keep the outage uncacheable.
    return { body: { sanityFleur: fleur }, ok: fleur !== null };
  });
