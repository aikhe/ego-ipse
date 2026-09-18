import type { PageServerLoad } from './$types';
import type { SanityOpusNvim } from '$lib/types/sanity';

export const prerender = false;

// Same-origin API (see src/routes/api/opus-nvim): Sanity is fetched
// server-side so phones never need to reach api.sanity.io directly.
async function getJson<T>(
  fetchFn: typeof fetch,
  url: string
): Promise<T | null> {
  try {
    const res = await fetchFn(url);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

// Accepts full GitHub URLs and owner/repo shorthand, returns the
// owner/repo pair or null when the value is not a GitHub repo ref.
function parseGitHubRepo(raw: string): string | null {
  const value = raw.trim();
  if (value.length === 0) return null;
  const short = value.match(/^([^/\s?#]+)\/([^/\s?#]+?)(?:\.git)?$/);
  if (short) return `${short[1]}/${short[2]}`;
  const url = value.match(
    /github\.com\/([^/\s?#]+)\/([^/\s?#]+?)(?:\.git)?(?:[/?#]|$)/
  );
  if (!url) return null;
  return `${url[1]}/${url[2]}`;
}

// Live star counts straight from the GitHub REST API. Unauthenticated
// calls are rate-limited per IP, so one batched pass runs here on the
// server (never throws: a failed repo simply resolves to no entry and
// renders without a tooltip).
async function getRepoStars(
  fetchFn: typeof fetch,
  repos: string[]
): Promise<Record<string, number>> {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'ego-ipse',
  };
  const entries = await Promise.all(
    repos.map(async repo => {
      const slug = parseGitHubRepo(repo);
      if (!slug) return null;
      try {
        const res = await fetchFn(`https://api.github.com/repos/${slug}`, {
          headers,
        });
        if (!res.ok) return null;
        const data = (await res.json()) as {
          stargazers_count?: unknown;
        };
        if (typeof data.stargazers_count !== 'number') return null;
        return [repo, data.stargazers_count] as const;
      } catch {
        return null;
      }
    })
  );
  const stars: Record<string, number> = {};
  for (const entry of entries) {
    if (entry) stars[entry[0]] = entry[1];
  }
  return stars;
}

export const load: PageServerLoad = async ({ fetch, setHeaders }) => {
  const nvimData = await getJson<{ sanityNvim?: SanityOpusNvim | null }>(
    fetch,
    '/api/opus-nvim'
  );
  const sanityNvim = nvimData?.sanityNvim ?? null;
  const repos = (sanityNvim?.plugins ?? [])
    .map(plugin => plugin.repo?.trim() ?? '')
    .filter(repo => repo.length > 0);
  const pluginStars = await getRepoStars(fetch, repos);
  // star counts change slowly: cache the page briefly so every visit
  // does not spend GitHub API budget on the same repos.
  setHeaders({
    'Cache-Control':
      'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
  });
  return {
    sanityNvim,
    pluginStars,
  };
};
