import { json } from '@sveltejs/kit';
import { cachedJson } from '$lib/server/edgeCache';
import {
  fetchSanityOpusWorkBySlug,
  isOpusWorkSlug,
} from '$lib/sanity/opusWorks';
import type { RequestHandler } from './$types';

export const prerender = false;

// Same-origin proxy (see ../+server.ts): `{ work: null }` when Sanity has no
// doc for the slug so the page can fall back to hardcoded data.
export const GET: RequestHandler = async event => {
  const { slug } = event.params;
  // junk slugs can never match a doc: answer without touching sanity.
  if (!isOpusWorkSlug(slug)) {
    return json({ work: null }, { headers: { 'Cache-Control': 'no-store' } });
  }
  return cachedJson(event, async () => {
    const work = await fetchSanityOpusWorkBySlug(fetch, slug);
    // null covers both missing docs and failed fetches: only cache a hit so
    // a transient outage cannot pin a real page as missing for hours.
    return { body: { work }, ok: work !== null };
  });
};
