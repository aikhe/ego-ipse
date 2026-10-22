import type { SanityOpusNvim } from '$lib/types/sanity';
import { normalizeRepoLinks } from './common';
import { fetchSanity } from './fetch';

// deterministic pick: oldest document wins if duplicates ever exist.
const query = `*[_type == "opusNvim"] | order(_createdAt asc)[0]{
  description,
  "configCard": configCard{ title, description },
  "plugins": plugins[]{ title, description, repo },
  "miscs": miscs[]{ title, description, repo }
}`;

function normalizeOpusNvim(
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
  const plugins = normalizeRepoLinks(raw.plugins);
  const miscs = normalizeRepoLinks(raw.miscs);
  if (!description && !configCard && !plugins && !miscs) return null;
  return {
    description: description || undefined,
    configCard,
    plugins,
    miscs,
  };
}

// never throws, returns null on failure so callers render nothing.
export function fetchSanityOpusNvim(fetchFn: typeof fetch = fetch) {
  return fetchSanity(fetchFn, {
    label: 'opusNvim',
    query,
    normalize: normalizeOpusNvim,
    fallback: null,
  });
}
