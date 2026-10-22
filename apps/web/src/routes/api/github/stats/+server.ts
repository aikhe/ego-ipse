import { cachedJson } from '$lib/server/edgeCache';
import type { RequestHandler } from './$types';

const GITHUB_USERNAME = 'aikhe';
const CACHE_CONTROL = 'public, max-age=300, s-maxage=3600';

interface GitHubUser {
  public_repos: number;
  followers: number;
}

interface GitHubRepo {
  stargazers_count: number;
}

interface GitHubSearch {
  total_count: number;
}

const headers = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'ego-ipse',
};

// unauthenticated github allows 60 req/hr/ip and this makes 3 per miss, so
// only fully successful results are cached; anything partial is no-store.
export const GET: RequestHandler = event =>
  cachedJson(
    event,
    async () => {
      let contribution = '—';
      let stars = '—';
      let repos = '—';
      let followers = '—';
      let ok = false;

      try {
        const [userRes, reposRes, commitsRes] = await Promise.all([
          fetch('https://api.github.com/users/' + GITHUB_USERNAME, { headers }),
          fetch(
            'https://api.github.com/users/' +
              GITHUB_USERNAME +
              '/repos?per_page=100',
            { headers }
          ),
          fetch(
            'https://api.github.com/search/commits?q=author:' +
              GITHUB_USERNAME +
              '&per_page=1',
            { headers }
          ),
        ]);
        ok = userRes.ok && reposRes.ok && commitsRes.ok;

        if (userRes.ok) {
          const user: GitHubUser = await userRes.json();
          repos = String(user.public_repos);
          followers = String(user.followers);
        }

        if (reposRes.ok) {
          const repoData: GitHubRepo[] = await reposRes.json();
          stars = String(
            repoData.reduce((sum, r) => sum + r.stargazers_count, 0)
          );
        }

        if (commitsRes.ok) {
          const commitsData: GitHubSearch = await commitsRes.json();
          contribution = String(commitsData.total_count ?? '—');
        }
      } catch {
        ok = false;
      }

      return { body: { contribution, stars, repos, followers }, ok };
    },
    CACHE_CONTROL
  );
