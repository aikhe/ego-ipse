import type { SanityOpusNvim } from '$lib/types/sanity';
import { SANITY_URL } from './opusValues';

// deterministic pick: oldest document wins if duplicates ever exist.
export const opusNvimQuery = `*[_type == "opusNvim"] | order(_createdAt asc)[0]{
  description,
  "configCard": configCard{ title, description },
  "plugins": plugins[]{ title, description, repo }
}`;

export function normalizeOpusNvim(
  raw: SanityOpusNvim | null | undefined
): SanityOpusNvim | null {
  if (!raw) return null;
  const description = raw.description?.trim();
  const configTitle = raw.configCard?.title?.trim();
  const configDescription = raw.configCard?.description?.trim();
  const configCard =
    configTitle && configDescription
      ? { title: configTitle, description: configDescription }
      : undefined;
  const plugins = (raw.plugins ?? [])
    .map(plugin => ({
      title: plugin.title?.trim() ?? '',
      description: plugin.description?.trim() ?? '',
      repo: plugin.repo?.trim() ?? '',
    }))
    .filter(plugin => plugin.title.length > 0 && plugin.repo.length > 0);
  if (!description && !configCard && plugins.length === 0) return null;
  return {
    description: description || undefined,
    configCard,
    plugins: plugins.length > 0 ? plugins : undefined,
  };
}

// never throws, returns null on failure so callers render nothing.
export async function fetchSanityOpusNvim(
  fetchFn: typeof fetch = fetch
): Promise<SanityOpusNvim | null> {
  try {
    const res = await fetchFn(
      `${SANITY_URL}?query=${encodeURIComponent(opusNvimQuery)}`
    );
    if (!res.ok) {
      console.error('Failed to fetch opusNvim from Sanity', await res.text());
      return null;
    }
    const data = (await res.json()) as { result?: SanityOpusNvim | null };
    return normalizeOpusNvim(data.result);
  } catch (err) {
    console.error('Error fetching opusNvim from Sanity:', err);
    return null;
  }
}
