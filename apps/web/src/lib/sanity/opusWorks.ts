import type { Work, WorkCell, WorkPreview } from '$lib/data/works';
import type { SanityOpusWork, SanityOpusWorkCell } from '$lib/types/sanity';

// same project/dataset as the landing-page loader in `src/routes/+page.server.ts`
export const SANITY_URL =
  'https://dn2lfgdt.api.sanity.io/v2022-03-07/data/query/production';

const cellProjection = `{
  "src": image.asset->url,
  "alt": coalesce(alt, ""),
  wide,
  ratio,
  "assetWidth": image.asset->metadata.dimensions.width,
  "assetHeight": image.asset->metadata.dimensions.height,
  width,
  height
}`;

const opusWorkProjection = `{
  _id,
  title,
  "slug": slug.current,
  description,
  selected,
  order,
  preview,
  "cells": cells[defined(image)]${cellProjection},
  "gallery": gallery[defined(image)]${cellProjection},
  quote{
    text,
    by,
    href,
    "avatar": avatar.asset->url
  },
  meta
}`;

export const opusWorksQuery = `*[_type == "opusWork"] ${opusWorkProjection}`;

const opusWorkBySlugQuery = (slug: string) =>
  `*[_type == "opusWork" && slug.current == ${JSON.stringify(slug)}][0] ${opusWorkProjection}`;

const opusWorkSlugsQuery = `*[_type == "opusWork" && defined(slug.current)].slug.current`;

function toPreview(value: number | undefined): WorkPreview {
  if (value === 1 || value === 2 || value === 3 || value === 4) return value;
  return 4;
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toWorkCell(
  raw: SanityOpusWorkCell,
  fallbackTitle: string,
  index: number
): WorkCell | null {
  const src = raw.src?.trim();
  if (!src) return null;
  const width = raw.width ?? raw.assetWidth;
  const height = raw.height ?? raw.assetHeight;
  const ratio = raw.ratio?.trim()
    ? raw.ratio.trim()
    : width && height
      ? `${width} / ${height}`
      : undefined;
  const alt = raw.alt?.trim()
    ? raw.alt.trim()
    : `${fallbackTitle} preview ${index + 1}`;
  return {
    src,
    alt,
    span: raw.wide ? 'wide' : undefined,
    ratio,
    width,
    height,
  };
}

export function mapSanityOpusWorkToWork(raw: SanityOpusWork): Work | null {
  const title = raw.title?.trim();
  if (!title) return null;
  const slug = raw.slug?.trim() ? raw.slug.trim() : slugify(title);
  if (!slug) return null;
  const cells = (raw.cells ?? [])
    .map((cell, i) => toWorkCell(cell, title, i))
    .filter((cell): cell is WorkCell => cell !== null);
  const gallery = (raw.gallery ?? [])
    .map((cell, i) => toWorkCell(cell, title, i))
    .filter((cell): cell is WorkCell => cell !== null);
  const previewCells = cells.length > 0 ? cells : gallery;
  const detailImages = gallery.length > 0 ? gallery : cells;
  const quoteText = raw.quote?.text?.trim();
  const quoteBy = raw.quote?.by?.trim();
  // Fixed order for display. Accepts the new `meta` object and the
  // legacy `meta[]` list so existing Sanity docs keep rendering during migration.
  const META_ORDER = [
    ['role', 'Role'],
    ['platform', 'Platform'],
    ['year', 'Year'],
    ['stack', 'Stack'],
    ['status', 'Status'],
  ] as const;
  function toMeta(rawMeta: SanityOpusWork['meta']): { k: string; v: string }[] {
    if (!rawMeta) return [];
    if (Array.isArray(rawMeta)) {
      const byKey = new Map<string, string>();
      for (const row of rawMeta) {
        const k = row.k?.trim().toLowerCase();
        const v = row.v?.trim();
        if (k && v && !byKey.has(k)) byKey.set(k, v);
      }
      const out: { k: string; v: string }[] = [];
      for (const [field, label] of META_ORDER) {
        const v = byKey.get(field);
        if (v) {
          out.push({ k: label, v });
          byKey.delete(field);
        }
      }
      // Preserve any custom legacy rows instead of dropping them.
      for (const [k, v] of byKey) out.push({ k, v });
      return out;
    }
    const out: { k: string; v: string }[] = [];
    for (const [field, label] of META_ORDER) {
      const v = rawMeta[field]?.trim();
      if (v) out.push({ k: label, v });
    }
    return out;
  }
  const meta = toMeta(raw.meta);
  return {
    title,
    slug,
    description: raw.description?.trim() ?? '',
    preview: toPreview(raw.preview),
    cells: previewCells,
    images: detailImages,
    quote:
      quoteText && quoteBy
        ? {
            text: quoteText,
            by: quoteBy,
            href: raw.quote?.href?.trim() ? raw.quote.href.trim() : undefined,
            avatar: raw.quote?.avatar?.trim()
              ? raw.quote.avatar.trim()
              : undefined,
          }
        : undefined,
    meta,
  };
}

function sortByOrder(a: SanityOpusWork, b: SanityOpusWork): number {
  return (
    (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER)
  );
}

export interface SanityOpusWorksResult {
  sanitySelected: Work[];
  sanityWorks: Work[];
}

export function splitMappedOpusWorks(
  rawList: SanityOpusWork[]
): SanityOpusWorksResult {
  const selected = rawList
    .filter(item => item.selected === true)
    .sort(sortByOrder)
    .map(mapSanityOpusWorkToWork)
    .filter((work): work is Work => work !== null);
  const regular = rawList
    .filter(item => item.selected !== true)
    .sort(sortByOrder)
    .map(mapSanityOpusWorkToWork)
    .filter((work): work is Work => work !== null);
  return { sanitySelected: selected, sanityWorks: regular };
}

// sanity first, hardcoded stays as fallback — never throws, returns empty lists on failure.
export async function fetchSanityOpusWorks(
  fetchFn: typeof fetch = fetch
): Promise<SanityOpusWorksResult> {
  const empty: SanityOpusWorksResult = { sanitySelected: [], sanityWorks: [] };
  try {
    const res = await fetchFn(
      `${SANITY_URL}?query=${encodeURIComponent(opusWorksQuery)}`
    );
    if (!res.ok) {
      console.error('Failed to fetch opusWorks from Sanity', await res.text());
      return empty;
    }
    const data = (await res.json()) as { result?: SanityOpusWork[] };
    return splitMappedOpusWorks(data.result ?? []);
  } catch (err) {
    console.error('Error fetching opusWorks from Sanity:', err);
    return empty;
  }
}

export async function fetchSanityOpusWorkBySlug(
  fetchFn: typeof fetch,
  slug: string
): Promise<Work | null> {
  try {
    const res = await fetchFn(
      `${SANITY_URL}?query=${encodeURIComponent(opusWorkBySlugQuery(slug))}`
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { result?: SanityOpusWork | null };
    if (!data.result) return null;
    return mapSanityOpusWorkToWork(data.result);
  } catch (err) {
    console.error('Error fetching opusWork by slug from Sanity:', err);
    return null;
  }
}

export async function fetchSanityOpusWorkSlugs(
  fetchFn: typeof fetch = fetch
): Promise<string[]> {
  try {
    const res = await fetchFn(
      `${SANITY_URL}?query=${encodeURIComponent(opusWorkSlugsQuery)}`
    );
    if (!res.ok) return [];
    const data = (await res.json()) as { result?: string[] };
    return (data.result ?? []).filter(
      slug => typeof slug === 'string' && slug.length > 0
    );
  } catch (err) {
    console.error('Error fetching opusWork slugs from Sanity:', err);
    return [];
  }
}

// prepend sanity before hardcoded; on slug collision sanity wins so card keys stay unique.
export function mergePreferSanity(sanity: Work[], hardcoded: Work[]): Work[] {
  const seen = new Set(sanity.map(work => work.slug));
  return [...sanity, ...hardcoded.filter(work => !seen.has(work.slug))];
}
