import type {
  SanityOpusDescription,
  SanityOpusGallery,
  SanityOpusRepoLink,
} from '$lib/types/sanity';

// image list projection shared by the gallery documents (fleur, knots, osn).
export const imagesProjection = `"images": images[defined(image)]{
    "src": image.asset->url,
    "alt": coalesce(alt, ""),
    "assetWidth": image.asset->metadata.dimensions.width,
    "assetHeight": image.asset->metadata.dimensions.height,
    width,
    height
  }`;

// sanity cdn serves raw full-res files by default: cap width + auto format
// so images ship optimized instead of multi-mb originals. non-sanity
// urls pass through untouched.
export function sizedSanityUrl(
  src: string,
  width = 1200,
  quality = 80
): string {
  if (!src.includes('cdn.sanity.io')) return src;
  const sep = src.includes('?') ? '&' : '?';
  return `${src}${sep}auto=format&w=${width}&q=${quality}&fit=max`;
}

// keep small candidates for cards and add enough steps for dense displays.
const SRCSET_STEPS = [400, 600, 900, 1200, 1600, 2000];

export function sanitySrcset(
  src: string,
  width = 1200,
  quality = 80
): string | undefined {
  if (!src.includes('cdn.sanity.io')) return undefined;
  const widths = [...SRCSET_STEPS.filter(w => w < width), width];
  if (widths.length < 2) return undefined;
  return widths.map(w => `${sizedSanityUrl(src, w, quality)} ${w}w`).join(', ');
}

// description-only documents (about, blogs, kaia, services).
export function normalizeOpusDescription(
  raw: SanityOpusDescription | null | undefined
): SanityOpusDescription | null {
  const description = raw?.description?.trim();
  return description ? { description } : null;
}

// trims description + images; null when nothing renderable is left.
export function normalizeOpusGallery(
  raw: SanityOpusGallery | null | undefined
): SanityOpusGallery | null {
  if (!raw) return null;
  const description = raw.description?.trim();
  const images = (raw.images ?? [])
    .map(img => ({
      src: img.src?.trim() || undefined,
      alt: img.alt?.trim() || undefined,
      assetWidth: img.assetWidth,
      assetHeight: img.assetHeight,
      width: img.width,
      height: img.height,
    }))
    .filter(img => img.src);
  if (!description && images.length === 0) return null;
  return {
    ...(description ? { description } : {}),
    ...(images.length > 0 ? { images } : {}),
  };
}

// keeps entries that have both a title and a repo; undefined when none do.
export function normalizeRepoLinks(
  raw: SanityOpusRepoLink[] | null | undefined
): SanityOpusRepoLink[] | undefined {
  const links = (raw ?? [])
    .map(link => ({
      title: link.title?.trim() ?? '',
      description: link.description?.trim() ?? '',
      repo: link.repo?.trim() ?? '',
    }))
    .filter(link => link.title.length > 0 && link.repo.length > 0);
  return links.length > 0 ? links : undefined;
}
