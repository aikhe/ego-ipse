import { cachedJson } from '$lib/server/edgeCache';
import { fetchSanityOpusServices } from '$lib/sanity/opusServices';
import type { RequestHandler } from './$types';

export const prerender = false;

// Same-origin proxy like opus-nvim: keeps Sanity server-side so mobile
// content-blockers never need to reach api.sanity.io directly.
export const GET: RequestHandler = event =>
  cachedJson(event, async () => {
    const services = await fetchSanityOpusServices();
    // null means the sanity fetch failed: keep the outage uncacheable.
    return { body: { sanityServices: services }, ok: services !== null };
  });
