import { cachedJson } from '$lib/server/edgeCache';
import type { RequestHandler } from './$types';

const GITHUB_USERNAME = 'aikhe';
const UPSTREAM =
  'https://github-contributions-api.jogruber.de/v4/' +
  GITHUB_USERNAME +
  '?y=last';
const CACHE_CONTROL = 'public, max-age=300, s-maxage=3600';

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

export const GET: RequestHandler = event =>
  cachedJson(
    event,
    async () => {
      try {
        const res = await fetch(UPSTREAM, {
          headers: { 'User-Agent': 'ego-ipse' },
        });
        if (!res.ok) return { body: fallback, ok: false };
        const data = (await res.json()) as UpstreamPayload;
        const contributions = Array.isArray(data.contributions)
          ? data.contributions
          : [];
        const total =
          typeof data.total === 'number'
            ? data.total
            : (data.total?.lastYear ??
              contributions.reduce((sum, d) => sum + d.count, 0));
        return { body: { total, contributions }, ok: true };
      } catch {
        return { body: fallback, ok: false };
      }
    },
    CACHE_CONTROL
  );
