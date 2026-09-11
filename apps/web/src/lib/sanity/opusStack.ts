import type { SanityOpusStack } from '$lib/types/sanity';
import { SANITY_URL } from './opusValues';

// deterministic pick: oldest document wins if duplicates ever exist.
export const opusStackQuery = `*[_type == "opusStack"] | order(_createdAt asc)[0]{
  description
}`;

export function normalizeOpusStack(
  raw: SanityOpusStack | null | undefined
): SanityOpusStack | null {
  if (!raw) return null;
  const description = raw.description?.trim();
  if (!description) return null;
  return { description };
}

// never throws, returns null on failure so callers render nothing.
export async function fetchSanityOpusStack(
  fetchFn: typeof fetch = fetch
): Promise<SanityOpusStack | null> {
  try {
    const res = await fetchFn(
      `${SANITY_URL}?query=${encodeURIComponent(opusStackQuery)}`
    );
    if (!res.ok) {
      console.error('Failed to fetch opusStack from Sanity', await res.text());
      return null;
    }
    const data = (await res.json()) as { result?: SanityOpusStack | null };
    return normalizeOpusStack(data.result);
  } catch (err) {
    console.error('Error fetching opusStack from Sanity:', err);
    return null;
  }
}
