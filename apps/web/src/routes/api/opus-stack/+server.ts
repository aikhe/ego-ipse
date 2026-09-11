import { json } from '@sveltejs/kit';
import { fetchSanityOpusStack } from '$lib/sanity/opusStack';
import type { RequestHandler } from './$types';

export const prerender = false;

// Same-origin proxy like opus-about: keeps Sanity server-side so mobile
// content-blockers never need to reach api.sanity.io directly.
export const GET: RequestHandler = async () => {
  const stack = await fetchSanityOpusStack();
  return json(
    { sanityStack: stack },
    { headers: { 'Cache-Control': 'no-store' } }
  );
};
