import type { SanityOpusBlogs } from '$lib/types/sanity';
import { SANITY_URL } from './opusValues';

// deterministic pick: oldest document wins if duplicates ever exist.
export const opusBlogsQuery = `*[_type == "opusBlogs"] | order(_createdAt asc)[0]{
  description
}`;

export function normalizeOpusBlogs(
  raw: SanityOpusBlogs | null | undefined
): SanityOpusBlogs | null {
  if (!raw) return null;
  const description = raw.description?.trim();
  if (!description) return null;
  return { description };
}

// never throws, returns null on failure so callers render nothing.
export async function fetchSanityOpusBlogs(
  fetchFn: typeof fetch = fetch
): Promise<SanityOpusBlogs | null> {
  try {
    const res = await fetchFn(
      `${SANITY_URL}?query=${encodeURIComponent(opusBlogsQuery)}`
    );
    if (!res.ok) {
      console.error('Failed to fetch opusBlogs from Sanity', await res.text());
      return null;
    }
    const data = (await res.json()) as { result?: SanityOpusBlogs | null };
    return normalizeOpusBlogs(data.result);
  } catch (err) {
    console.error('Error fetching opusBlogs from Sanity:', err);
    return null;
  }
}
