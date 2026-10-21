import { cachedJson } from '$lib/server/edgeCache';
import { fetchSanityOpusBlogs } from '$lib/sanity/opusBlogs';
import type { RequestHandler } from './$types';

export const prerender = false;

// Same-origin proxy like opus-services: keeps Sanity server-side so mobile
// content-blockers never need to reach api.sanity.io directly.
export const GET: RequestHandler = event =>
  cachedJson(event, async () => {
    const blogs = await fetchSanityOpusBlogs();
    // null means the sanity fetch failed: keep the outage uncacheable.
    return { body: { sanityBlogs: blogs }, ok: blogs !== null };
  });
