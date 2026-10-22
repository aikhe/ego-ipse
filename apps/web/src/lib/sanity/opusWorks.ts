import type { Work, WorkCell } from '$lib/types/work';
import type { SanityOpusWork, SanityOpusWorkCell } from '$lib/types/sanity';
import { sizedSanityUrl } from './common';
import { fetchSanity } from './fetch';

// sanity-generated slugs only; anything else cannot match a doc.
export function isOpusWorkSlug(slug: string): boolean {
  return /^[a-z0-9-]{1,96}$/.test(slug);
}

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

const opusWorksQuery = `*[_type == "opusWork"] ${opusWorkProjection}`;

const opusWorkBySlugQuery = `*[_type == "opusWork" && slug.current == $slug][0] ${opusWorkProjection}`;

function toPreview(value: number | undefined): Work['preview'] {
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
  index: number,
  cdnWidth = 900
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
  // width/height stay intrinsic so aspect-ratio lock + cls are unaffected.
  return {
    src: sizedSanityUrl(src, cdnWidth, 75),
    alt,
    span: raw.wide ? 'wide' : undefined,
    ratio,
    width,
    height,
  };
}

// fixed display order for meta rows.
const META_ORDER = [
  ['role', 'Role'],
  ['platform', 'Platform'],
  ['year', 'Year'],
  ['stack', 'Stack'],
  ['status', 'Status'],
] as const;

// accepts the `meta` object and the legacy `meta[]` list so existing
// Sanity docs keep rendering during migration.
function toMeta(rawMeta: SanityOpusWork['meta']): Work['meta'] {
  if (!rawMeta) return [];
  if (Array.isArray(rawMeta)) {
    const byKey = new Map<string, string>();
    for (const row of rawMeta) {
      const k = row.k?.trim().toLowerCase();
      const v = row.v?.trim();
      if (k && v && !byKey.has(k)) byKey.set(k, v);
    }
    const out: Work['meta'] = [];
    for (const [field, label] of META_ORDER) {
      const v = byKey.get(field);
      if (v) {
        out.push({ k: label, v });
        byKey.delete(field);
      }
    }
    // preserve any custom legacy rows instead of dropping them.
    for (const [k, v] of byKey) out.push({ k, v });
    return out;
  }
  const out: Work['meta'] = [];
  for (const [field, label] of META_ORDER) {
    const v = rawMeta[field]?.trim();
    if (v) out.push({ k: label, v });
  }
  return out;
}

function mapSanityOpusWorkToWork(raw: SanityOpusWork): Work | null {
  const title = raw.title?.trim();
  if (!title) return null;
  const slug = raw.slug?.trim() ? raw.slug.trim() : slugify(title);
  if (!slug) return null;
  const cells = (raw.cells ?? []).flatMap(
    (cell, i) => toWorkCell(cell, title, i) ?? []
  );
  // detail gallery spans past the column (100% + 20rem): 1600px so wide
  // desktop cells stay sharp while cards stay capped at 900px.
  const gallery = (raw.gallery ?? []).flatMap(
    (cell, i) => toWorkCell(cell, title, i, 1600) ?? []
  );
  const quoteText = raw.quote?.text?.trim();
  const quoteBy = raw.quote?.by?.trim();
  return {
    title,
    slug,
    description: raw.description?.trim() ?? '',
    preview: toPreview(raw.preview),
    cells: cells.length > 0 ? cells : gallery,
    images: gallery.length > 0 ? gallery : cells,
    quote:
      quoteText && quoteBy
        ? {
            text: quoteText,
            by: quoteBy,
            href: raw.quote?.href?.trim() ? raw.quote.href.trim() : undefined,
            // 64px avatar slot: 96px cdn output is plenty.
            avatar: raw.quote?.avatar?.trim()
              ? sizedSanityUrl(raw.quote.avatar.trim(), 96, 75)
              : undefined,
          }
        : undefined,
    meta: toMeta(raw.meta),
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

function splitMappedOpusWorks(
  rawList: SanityOpusWork[] | null | undefined
): SanityOpusWorksResult {
  const mapGroup = (selected: boolean) =>
    (rawList ?? [])
      .filter(item => (item.selected === true) === selected)
      .sort(sortByOrder)
      .flatMap(item => mapSanityOpusWorkToWork(item) ?? []);
  return { sanitySelected: mapGroup(true), sanityWorks: mapGroup(false) };
}

// never throws, returns empty lists on failure.
export function fetchSanityOpusWorks(fetchFn: typeof fetch = fetch) {
  return fetchSanity(fetchFn, {
    label: 'opusWorks',
    query: opusWorksQuery,
    normalize: splitMappedOpusWorks,
    fallback: { sanitySelected: [], sanityWorks: [] },
  });
}

// null when the doc is missing or the fetch failed.
export function fetchSanityOpusWorkBySlug(fetchFn: typeof fetch, slug: string) {
  return fetchSanity(fetchFn, {
    label: 'opusWork by slug',
    query: opusWorkBySlugQuery,
    params: { slug },
    normalize: (raw: SanityOpusWork | null | undefined) =>
      raw ? mapSanityOpusWorkToWork(raw) : null,
    fallback: null,
  });
}
