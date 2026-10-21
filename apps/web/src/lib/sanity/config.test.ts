import { describe, expect, it } from 'vitest';
import { SANITY_URL, sanityQueryUrl } from './config';
import { isOpusWorkSlug } from './opusWorks';

describe('sanityQueryUrl', () => {
  it('json-encodes params as GROQ $parameters instead of inlining them', () => {
    const slug = 'x" || true || "';
    const url = new URL(
      sanityQueryUrl('*[slug.current == $slug][0]', { slug })
    );
    expect(url.origin + url.pathname).toBe(SANITY_URL);
    expect(url.searchParams.get('query')).toBe('*[slug.current == $slug][0]');
    expect(url.searchParams.get('$slug')).toBe(JSON.stringify(slug));
  });
});

describe('isOpusWorkSlug', () => {
  it('accepts sanity slugs and rejects junk', () => {
    expect(isOpusWorkSlug('opus-paper-2')).toBe(true);
    expect(isOpusWorkSlug('')).toBe(false);
    expect(isOpusWorkSlug('Has Space')).toBe(false);
    expect(isOpusWorkSlug('a"b')).toBe(false);
    expect(isOpusWorkSlug('a'.repeat(97))).toBe(false);
  });
});
