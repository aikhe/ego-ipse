import type { SanityOpusKnots } from '$lib/types/sanity';
import { SANITY_URL } from './opusValues';

// deterministic pick: oldest document wins if duplicates ever exist.
export const opusKnotsQuery = `*[_type == "opusKnots"] | order(_createdAt asc)[0]{
  description,
  "images": images[defined(image)]{
    "src": image.asset->url,
    "alt": coalesce(alt, ""),
    "assetWidth": image.asset->metadata.dimensions.width,
    "assetHeight": image.asset->metadata.dimensions.height,
    width,
    height
  }
}`;

function normalizeKnotsImages(
  raw: SanityOpusKnots['images'] | null | undefined
): SanityOpusKnots['images'] | undefined {
  if (!raw) return undefined;
  const out = raw
    .map(img => ({
      src: img.src?.trim() || undefined,
      alt: img.alt?.trim() || undefined,
      assetWidth: img.assetWidth,
      assetHeight: img.assetHeight,
      width: img.width,
      height: img.height,
    }))
    .filter(img => img.src);
  return out.length > 0 ? out : undefined;
}

// sanity cdn serves raw full-res files by default: cap width + auto format
// so figures ship optimized instead of multi-mb originals. non-sanity
// urls pass through untouched.
export function sizedKnotsUrl(src: string, width = 1200): string {
  if (!src.includes('cdn.sanity.io')) return src;
  const sep = src.includes('?') ? '&' : '?';
  return `${src}${sep}auto=format&w=${width}&q=80&fit=max`;
}

export function normalizeOpusKnots(
  raw: SanityOpusKnots | null | undefined
): SanityOpusKnots | null {
  if (!raw) return null;
  const description = raw.description?.trim();
  const images = normalizeKnotsImages(raw.images);
  if (!description && !images) return null;
  return {
    ...(description ? { description } : {}),
    ...(images ? { images } : {}),
  };
}

// never throws, returns null on failure so callers render nothing.
export async function fetchSanityOpusKnots(
  fetchFn: typeof fetch = fetch
): Promise<SanityOpusKnots | null> {
  try {
    const res = await fetchFn(
      `${SANITY_URL}?query=${encodeURIComponent(opusKnotsQuery)}`
    );
    if (!res.ok) {
      console.error('Failed to fetch opusKnots from Sanity', await res.text());
      return null;
    }
    const data = (await res.json()) as { result?: SanityOpusKnots | null };
    return normalizeOpusKnots(data.result);
  } catch (err) {
    console.error('Error fetching opusKnots from Sanity:', err);
    return null;
  }
}
