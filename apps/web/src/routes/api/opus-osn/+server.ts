import { error } from '@sveltejs/kit';
import { cachedJson } from '$lib/server/edgeCache';
import { fetchSanityOpusOsn } from '$lib/sanity/opusOsn';
import type { RequestHandler } from './$types';

export const prerender = false;

// hidden until the osn case study is ready — remove to re-enable
// (together with the page gate in (opus)/osn/+layout.server.ts)
const hidden: boolean = true;

// Same-origin proxy like opus-fleur: keeps Sanity server-side so mobile
// content-blockers never need to reach api.sanity.io directly.
export const GET: RequestHandler = event => {
  if (hidden) error(404, 'Not found');
  return cachedJson(event, async () => {
    const osn = await fetchSanityOpusOsn();
    // null means the sanity fetch failed: keep the outage uncacheable.
    return { body: { sanityOsn: osn }, ok: osn !== null };
  });
};
