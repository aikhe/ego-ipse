import { json } from '@sveltejs/kit';

const GH_USERNAME = 'aikhe';

export const GET = async () => {
  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${GH_USERNAME}`),
      fetch(`https://api.github.com/users/${GH_USERNAME}/repos?per_page=100`),
    ]);

    if (!userRes.ok || !reposRes.ok) {
      return new Response(
        JSON.stringify({ error: 'GitHub API error', user: userRes.status, repos: reposRes.status }),
        { status: 502 }
      );
    }

    const user = await userRes.json();
    const repos: { stargazers_count: number }[] = await reposRes.json();
    const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);

    return json({
      stars: totalStars,
      repos: user.public_repos,
      followers: user.followers,
    });
  } catch (err) {
    console.error('GitHub stats fetch error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 });
  }
};
