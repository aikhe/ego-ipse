import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

const GH_USERNAME = 'aikhe';

interface GitHubStats {
  contributions: number | null;
  stars: number;
  repos: number;
  followers: number;
}

function fetchStats(token?: string): Promise<[Response, Response, Response]> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  return Promise.all([
    fetch(`https://api.github.com/users/${GH_USERNAME}`, { headers }),
    fetch(`https://api.github.com/users/${GH_USERNAME}/repos?per_page=100`, { headers }),
    fetch(`https://api.github.com/search/commits?q=author:${GH_USERNAME}`, { headers }),
  ]);
}

export const GET: RequestHandler = async () => {
  const token = env.GITHUB_TOKEN;

  try {
    let [userRes, reposRes, searchRes] = await fetchStats(token);

    // if auth returns 403, retry without token (broken token or wrong perms)
    if (token && userRes.status === 403 && reposRes.status === 403) {
      console.warn('GitHub token rejected (403), falling back to unauthenticated');
      [userRes, reposRes, searchRes] = await fetchStats();
    }

    if (!userRes.ok || !reposRes.ok) {
      console.error('GitHub API error', {
        user: userRes.status,
        repos: reposRes.status,
        search: searchRes.status,
        hasToken: !!token,
      });
      return new Response(
        JSON.stringify({
          error: 'GitHub API error',
          user: userRes.status,
          repos: reposRes.status,
          search: searchRes.status,
          hasToken: !!token,
        }),
        { status: 502 }
      );
    }

    const user = await userRes.json();
    const repos: { stargazers_count: number }[] = await reposRes.json();
    const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
    const contributions = searchRes.ok
      ? ((await searchRes.json()).total_count ?? null)
      : null;

    return new Response(
      JSON.stringify({
        contributions,
        stars: totalStars,
        repos: user.public_repos,
        followers: user.followers,
      } satisfies GitHubStats),
      { headers: { 'content-type': 'application/json' } }
    );
  } catch (err) {
    console.error('GitHub stats fetch error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
    });
  }
};
