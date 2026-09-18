import type { SanityOpusFleur } from '$lib/types/sanity';
import { SANITY_URL } from './opusValues';

// deterministic pick: oldest document wins if duplicates ever exist.
export const opusFleurQuery = `*[_type == "opusFleur"] | order(_createdAt asc)[0]{
  description,
  "images": images[defined(image)]{
    "src": image.asset->url,
    "alt": coalesce(alt, ""),
    "assetWidth": image.asset->metadata.dimensions.width,
    "assetHeight": image.asset->metadata.dimensions.height,
    width,
    height
  },
  "extras": extras[]{ title, description, repo }
}`;

function normalizeFleurImages(
  raw: SanityOpusFleur['images'] | null | undefined
): SanityOpusFleur['images'] | undefined {
  if (!raw) return undefined;
  const out = raw
    .map((img) => ({
      src: img.src?.trim() || undefined,
      alt: img.alt?.trim() || undefined,
      assetWidth: img.assetWidth,
      assetHeight: img.assetHeight,
      width: img.width,
      height: img.height,
    }))
    .filter((img) => img.src);
  return out.length > 0 ? out : undefined;
}

// sanity cdn serves raw full-res files by default: cap width + auto format
// so figures ship optimized instead of multi-mb originals. non-sanity
// urls pass through untouched.
export function sizedFleurUrl(src: string, width = 1200): string {
  if (!src.includes('cdn.sanity.io')) return src;
  const sep = src.includes('?') ? '&' : '?';
  return `${src}${sep}auto=format&w=${width}&q=80&fit=max`;
}

export function normalizeOpusFleur(
  raw: SanityOpusFleur | null | undefined
): SanityOpusFleur | null {
  if (!raw) return null;
  const description = raw.description?.trim();
  const images = normalizeFleurImages(raw.images);
  const extras = (raw.extras ?? [])
    .map((extra) => ({
      title: extra.title?.trim() ?? '',
      description: extra.description?.trim() ?? '',
      repo: extra.repo?.trim() ?? '',
    }))
    .filter((extra) => extra.title.length > 0 && extra.repo.length > 0);
  if (!description && !images && extras.length === 0) return null;
  return {
    ...(description ? { description } : {}),
    ...(images ? { images } : {}),
    ...(extras.length > 0 ? { extras } : {}),
  };
}

// never throws, returns null on failure so callers render nothing.
export async function fetchSanityOpusFleur(
  fetchFn: typeof fetch = fetch
): Promise<SanityOpusFleur | null> {
  try {
    const res = await fetchFn(
      `${SANITY_URL}?query=${encodeURIComponent(opusFleurQuery)}`
    );
    if (!res.ok) {
      console.error('Failed to fetch opusFleur from Sanity', await res.text());
      return null;
    }
    const data = (await res.json()) as { result?: SanityOpusFleur | null };
    return normalizeOpusFleur(data.result);
  } catch (err) {
    console.error('Error fetching opusFleur from Sanity:', err);
    return null;
  }
}
