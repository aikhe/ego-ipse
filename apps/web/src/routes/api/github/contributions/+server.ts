const GITHUB_USERNAME = 'aikhe';
const UPSTREAM =
  'https://github-contributions-api.jogruber.de/v4/' +
  GITHUB_USERNAME +
  '?y=last';

interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

interface UpstreamPayload {
  total?: Record<string, number> | number;
  contributions?: ContributionDay[];
}

const fallback = { total: 0, contributions: [] as ContributionDay[] };

export async function GET() {
  try {
    const res = await fetch(UPSTREAM, {
      headers: { 'User-Agent': 'ego-ipse' },
    });
    if (!res.ok) {
      return Response.json(fallback, { status: 200 });
    }
    const data = (await res.json()) as UpstreamPayload;
    const contributions = Array.isArray(data.contributions)
      ? data.contributions
      : [];
    const total =
      typeof data.total === 'number'
        ? data.total
        : (data.total?.lastYear ??
          contributions.reduce((sum, d) => sum + d.count, 0));
    return Response.json(
      { total, contributions },
      {
        headers: {
          'cache-control': 'public, s-maxage=3600, stale-while-revalidate=300',
        },
      }
    );
  } catch {
    return Response.json(fallback, { status: 200 });
  }
}
