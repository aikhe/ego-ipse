import type {
  SanityOpusStack,
  SanityOpusStackCategory,
} from '$lib/types/sanity';
import { sizedSanityUrl } from './common';
import { fetchSanity } from './fetch';

// deterministic pick: oldest document wins if duplicates ever exist.
const query = `*[_type == "opusStack"] | order(_createdAt asc)[0]{
  description,
  "categories": categories[]{
    title,
    "items": items[]{
      name,
      href,
      size,
      "iconLightUrl": iconLight.asset->url,
      "iconDarkUrl": iconDark.asset->url
    }
  }
}`;

function normalizeIconUrl(url: string | undefined): string | undefined {
  const trimmed = url?.trim();
  if (!trimmed) return undefined;
  // svg assets bypass the cdn sizing params (no raster transform available).
  if (trimmed.endsWith('.svg') || trimmed.includes('.svg?')) return trimmed;
  return sizedSanityUrl(trimmed, 320);
}

function normalizeSize(size: unknown): number | undefined {
  if (typeof size !== 'number' || !Number.isFinite(size)) return undefined;
  if (size === 1) return undefined;
  return Math.min(2, Math.max(0.5, size));
}

function normalizeCategories(
  raw: SanityOpusStackCategory[] | null | undefined
): SanityOpusStackCategory[] | undefined {
  if (!raw) return undefined;
  const out = raw
    .map(cat => ({
      title: cat.title?.trim() || undefined,
      items: (cat.items ?? [])
        .map(item => ({
          name: item.name?.trim() || undefined,
          href: item.href?.trim() || undefined,
          size: normalizeSize(item.size),
          iconLightUrl: normalizeIconUrl(item.iconLightUrl),
          iconDarkUrl: normalizeIconUrl(item.iconDarkUrl),
        }))
        .filter(item => item.name && item.iconLightUrl && item.iconDarkUrl),
    }))
    .filter(cat => cat.title && cat.items && cat.items.length > 0);
  return out.length > 0 ? out : undefined;
}

function normalizeOpusStack(
  raw: SanityOpusStack | null | undefined
): SanityOpusStack | null {
  if (!raw) return null;
  const description = raw.description?.trim();
  const categories = normalizeCategories(raw.categories);
  if (!description && !categories) return null;
  return {
    ...(description ? { description } : {}),
    ...(categories ? { categories } : {}),
  };
}

// never throws, returns null on failure so callers render nothing.
export function fetchSanityOpusStack(fetchFn: typeof fetch = fetch) {
  return fetchSanity(fetchFn, {
    label: 'opusStack',
    query,
    normalize: normalizeOpusStack,
    fallback: null,
  });
}
