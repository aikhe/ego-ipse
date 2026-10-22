import { cachedJson } from '$lib/server/edgeCache';
import { fetchSanityOpusKaia } from '$lib/sanity/opusKaia';
import type { RequestHandler } from './$types';

// Same-origin proxy like opus-about: keeps Sanity server-side so mobile
// content-blockers never need to reach api.sanity.io directly.
export const GET: RequestHandler = event =>
  cachedJson(event, async () => {
    const kaia = await fetchSanityOpusKaia();
    // null means the sanity fetch failed: keep the outage uncacheable.
    return { body: { sanityKaia: kaia }, ok: kaia !== null };
  });
