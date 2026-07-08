const GITHUB_USERNAME = 'aikhe';

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

export async function GET() {
  try {
    const [userRes, reposRes, commitsRes] = await Promise.all([
      fetch('https://api.github.com/users/' + GITHUB_USERNAME, { headers }),
      fetch('https://api.github.com/users/' + GITHUB_USERNAME + '/repos?per_page=100', { headers }),
      fetch('https://api.github.com/search/commits?q=author:' + GITHUB_USERNAME + '&per_page=1', { headers }),
    ]);

    let contribution = '—';
    let stars = '—';
    let repos = '—';
    let followers = '—';

    if (userRes.ok) {
      const user: GitHubUser = await userRes.json();
      repos = String(user.public_repos);
      followers = String(user.followers);
    }

    if (reposRes.ok) {
      const repoData: GitHubRepo[] = await reposRes.json();
      stars = String(repoData.reduce((sum, r) => sum + r.stargazers_count, 0));
    }

    if (commitsRes.ok) {
      const commitsData: GitHubSearch = await commitsRes.json();
      contribution = String(commitsData.total_count ?? '—');
    }

    return new Response(JSON.stringify({ contribution, stars, repos, followers }), {
      headers: {
        'content-type': 'application/json',
        'cache-control': 'public, s-maxage=3600, stale-while-revalidate=300',
      },
    });
  } catch {
    return new Response(
      JSON.stringify({ contribution: '—', stars: '—', repos: '—', followers: '—' }),
      {
        headers: { 'content-type': 'application/json' },
      }
    );
  }
}
