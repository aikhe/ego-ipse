import { env } from '$env/dynamic/private';

// unauthenticated calls get 60 req/hr per ip, and cloudflare's shared egress
// ips burn through that fast. an optional GITHUB_TOKEN lifts it to 5000/hr.
// read per request: on workers the env is only populated inside a request.
export function githubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'ego-ipse',
  };
  if (env.GITHUB_TOKEN) headers.Authorization = `Bearer ${env.GITHUB_TOKEN}`;
  return headers;
}

// accepts full github urls and owner/repo shorthand, returns the
// owner/repo pair or null when the value is not a github repo ref.
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

// live star counts keyed by the repo value as given. never throws: `ok` is
// false when any github lookup failed so callers can skip caching the gap.
// non-github values are skipped without counting as a failure.
export async function getRepoStars(
  fetchFn: typeof fetch,
  repos: string[]
): Promise<{ stars: Record<string, number>; ok: boolean }> {
  const headers = githubHeaders();
  const results = await Promise.all(
    repos.map(async repo => {
      const slug = parseGitHubRepo(repo);
      if (!slug) return { repo, count: null, failed: false };
      try {
        const res = await fetchFn(`https://api.github.com/repos/${slug}`, {
          headers,
        });
        if (!res.ok) return { repo, count: null, failed: true };
        const data = (await res.json()) as { stargazers_count?: unknown };
        const count = data.stargazers_count;
        if (typeof count !== 'number')
          return { repo, count: null, failed: true };
        return { repo, count, failed: false };
      } catch {
        return { repo, count: null, failed: true };
      }
    })
  );
  const stars: Record<string, number> = {};
  for (const { repo, count } of results) {
    if (count !== null) stars[repo] = count;
  }
  return { stars, ok: results.every(result => !result.failed) };
}
