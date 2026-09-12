import type { SanityOpusAbout } from '$lib/types/sanity';
import { SANITY_URL } from './opusValues';

// deterministic pick: oldest document wins if duplicates ever exist.
export const opusAboutQuery = `*[_type == "opusAbout"] | order(_createdAt asc)[0]{
  description
}`;

export function normalizeOpusAbout(
  raw: SanityOpusAbout | null | undefined
): SanityOpusAbout | null {
  if (!raw) return null;
  const description = raw.description?.trim();
  if (!description) return null;
  return { description };
}

// never throws, returns null on failure so callers render nothing.
export async function fetchSanityOpusAbout(
  fetchFn: typeof fetch = fetch
): Promise<SanityOpusAbout | null> {
  try {
    const res = await fetchFn(
      `${SANITY_URL}?query=${encodeURIComponent(opusAboutQuery)}`
    );
    if (!res.ok) {
      console.error('Failed to fetch opusAbout from Sanity', await res.text());
      return null;
    }
    const data = (await res.json()) as { result?: SanityOpusAbout | null };
    return normalizeOpusAbout(data.result);
  } catch (err) {
    console.error('Error fetching opusAbout from Sanity:', err);
    return null;
  }
}
