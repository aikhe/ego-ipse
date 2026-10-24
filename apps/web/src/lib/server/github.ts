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

const STARS_TTL_MS = 10 * 60 * 1000;

// last good count per owner/repo, alive as long as the dev server or worker
// isolate. reloads reuse it instead of spending the hourly budget (vite dev
// has no edge cache), and a failed lookup falls back to it.
const starsMemo = new Map<string, { count: number; at: number }>();

async function fetchStars(
  fetchFn: typeof fetch,
  slug: string,
  headers: Record<string, string>
): Promise<number | null> {
  const res = await fetchFn(`https://api.github.com/repos/${slug}`, {
    headers,
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { stargazers_count?: unknown };
  return typeof data.stargazers_count === 'number'
    ? data.stargazers_count
    : null;
}

// star counts keyed by the repo value as given. never throws: `ok` is false
// when any github repo has no count so callers can skip caching the gap.
// non-github values are skipped without counting as a failure.
export async function getRepoStars(
  fetchFn: typeof fetch,
  repos: string[]
): Promise<{ stars: Record<string, number>; ok: boolean }> {
  const headers = githubHeaders();
  const stars: Record<string, number> = {};
  let ok = true;
  await Promise.all(
    repos.map(async repo => {
      const slug = parseGitHubRepo(repo);
      if (!slug) return;
      const memo = starsMemo.get(slug);
      let count =
        memo && Date.now() - memo.at < STARS_TTL_MS ? memo.count : null;
      if (count === null) {
        count = await fetchStars(fetchFn, slug, headers).catch(() => null);
        if (count !== null) starsMemo.set(slug, { count, at: Date.now() });
        else count = memo?.count ?? null;
      }
      if (count === null) ok = false;
      else stars[repo] = count;
    })
  );
  return { stars, ok };
}
