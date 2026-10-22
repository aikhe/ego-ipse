import { normalizeOpusDescription } from './common';
import { fetchSanity } from './fetch';

// deterministic pick: oldest document wins if duplicates ever exist.
const query = `*[_type == "opusAbout"] | order(_createdAt asc)[0]{
  description
}`;

// never throws, returns null on failure so callers render nothing.
export function fetchSanityOpusAbout(fetchFn: typeof fetch = fetch) {
  return fetchSanity(fetchFn, {
    label: 'opusAbout',
    query,
    normalize: normalizeOpusDescription,
    fallback: null,
  });
}
