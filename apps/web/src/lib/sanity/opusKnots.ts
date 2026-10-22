import { imagesProjection, normalizeOpusGallery } from './common';
import { fetchSanity } from './fetch';

// deterministic pick: oldest document wins if duplicates ever exist.
const query = `*[_type == "opusKnots"] | order(_createdAt asc)[0]{
  description,
  ${imagesProjection}
}`;

// never throws, returns null on failure so callers render nothing.
export function fetchSanityOpusKnots(fetchFn: typeof fetch = fetch) {
  return fetchSanity(fetchFn, {
    label: 'opusKnots',
    query,
    normalize: normalizeOpusGallery,
    fallback: null,
  });
}
