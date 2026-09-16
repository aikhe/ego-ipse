import type { SanityOpusServices } from '$lib/types/sanity';
import { SANITY_URL } from './opusValues';

// deterministic pick: oldest document wins if duplicates ever exist.
export const opusServicesQuery = `*[_type == "opusServices"] | order(_createdAt asc)[0]{
  description
}`;

export function normalizeOpusServices(
  raw: SanityOpusServices | null | undefined
): SanityOpusServices | null {
  if (!raw) return null;
  const description = raw.description?.trim();
  if (!description) return null;
  return { description };
}

// never throws, returns null on failure so callers render nothing.
export async function fetchSanityOpusServices(
  fetchFn: typeof fetch = fetch
): Promise<SanityOpusServices | null> {
  try {
    const res = await fetchFn(
      `${SANITY_URL}?query=${encodeURIComponent(opusServicesQuery)}`
    );
    if (!res.ok) {
      console.error(
        'Failed to fetch opusServices from Sanity',
        await res.text()
      );
      return null;
    }
    const data = (await res.json()) as { result?: SanityOpusServices | null };
    return normalizeOpusServices(data.result);
  } catch (err) {
    console.error('Error fetching opusServices from Sanity:', err);
    return null;
  }
}
