import { cachedJson } from '$lib/server/edgeCache';
import { getRepoStars } from '$lib/server/github';
import { fetchSanityOpusNvim } from '$lib/sanity/opusNvim';
import type { RequestHandler } from './$types';

// Same-origin proxy like opus-about: keeps Sanity server-side so mobile
// content-blockers never need to reach api.sanity.io directly. star counts
// ride along so they share the edge cache instead of hitting github per view.
export const GET: RequestHandler = event =>
  cachedJson(event, async () => {
    const nvim = await fetchSanityOpusNvim();
    const repos = [...(nvim?.plugins ?? []), ...(nvim?.miscs ?? [])].flatMap(
      link => (link.repo ? [link.repo] : [])
    );
    const { stars, ok } = await getRepoStars(fetch, repos);
    // a failed sanity or github fetch stays uncacheable so the next view retries.
    return {
      body: { sanityNvim: nvim, pluginStars: stars },
      ok: nvim !== null && ok,
    };
  });
