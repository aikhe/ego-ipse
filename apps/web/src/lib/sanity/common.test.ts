import { describe, expect, it } from 'vitest';
import { sanitySrcset } from './common';

const SRC = 'https://cdn.sanity.io/images/p/d/a-1430x1380.webp';

describe('sanitySrcset', () => {
  it('steps up to the capped width', () => {
    expect(sanitySrcset(SRC, 900, 75)).toBe(
      [400, 600, 900]
        .map(w => `${SRC}?auto=format&w=${w}&q=75&fit=max ${w}w`)
        .join(', ')
    );
  });

  it('skips non-sanity urls and caps too small to step', () => {
    expect(sanitySrcset('/local.webp', 900)).toBeUndefined();
    expect(sanitySrcset(SRC, 320)).toBeUndefined();
  });
});
