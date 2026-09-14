import type { SanityOpusKaia } from '$lib/types/sanity';
import { SANITY_URL } from './opusValues';

// deterministic pick: oldest document wins if duplicates ever exist.
export const opusKaiaQuery = `*[_type == "opusKaia"] | order(_createdAt asc)[0]{
  description
}`;

export function normalizeOpusKaia(
  raw: SanityOpusKaia | null | undefined
): SanityOpusKaia | null {
  if (!raw) return null;
  const description = raw.description?.trim();
  if (!description) return null;
  return { description };
}

// never throws, returns null on failure so callers render nothing.
export async function fetchSanityOpusKaia(
  fetchFn: typeof fetch = fetch
): Promise<SanityOpusKaia | null> {
  try {
    const res = await fetchFn(
      `${SANITY_URL}?query=${encodeURIComponent(opusKaiaQuery)}`
    );
    if (!res.ok) {
      console.error('Failed to fetch opusKaia from Sanity', await res.text());
      return null;
    }
    const data = (await res.json()) as { result?: SanityOpusKaia | null };
    return normalizeOpusKaia(data.result);
  } catch (err) {
    console.error('Error fetching opusKaia from Sanity:', err);
    return null;
  }
}
