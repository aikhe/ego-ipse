import type { SanityOpusFleur } from '$lib/types/sanity';
import {
  imagesProjection,
  normalizeOpusGallery,
  normalizeRepoLinks,
} from './common';
import { fetchSanity } from './fetch';

// deterministic pick: oldest document wins if duplicates ever exist.
const query = `*[_type == "opusFleur"] | order(_createdAt asc)[0]{
  description,
  ${imagesProjection},
  "extras": extras[]{ title, description, repo }
}`;

function normalizeOpusFleur(
  raw: SanityOpusFleur | null | undefined
): SanityOpusFleur | null {
  const gallery = normalizeOpusGallery(raw);
  const extras = normalizeRepoLinks(raw?.extras);
  if (!gallery && !extras) return null;
  return { ...gallery, ...(extras ? { extras } : {}) };
}

// never throws, returns null on failure so callers render nothing.
export function fetchSanityOpusFleur(fetchFn: typeof fetch = fetch) {
  return fetchSanity(fetchFn, {
    label: 'opusFleur',
    query,
    normalize: normalizeOpusFleur,
    fallback: null,
  });
}
