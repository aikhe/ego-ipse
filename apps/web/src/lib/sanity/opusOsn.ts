import { imagesProjection, normalizeOpusGallery } from './common';
import { fetchSanity } from './fetch';

// deterministic pick: oldest document wins if duplicates ever exist.
const query = `*[_type == "opusOsn"] | order(_createdAt asc)[0]{
  description,
  ${imagesProjection}
}`;

// never throws, returns null on failure so callers render nothing.
export function fetchSanityOpusOsn(fetchFn: typeof fetch = fetch) {
  return fetchSanity(fetchFn, {
    label: 'opusOsn',
    query,
    normalize: normalizeOpusGallery,
    fallback: null,
  });
}
