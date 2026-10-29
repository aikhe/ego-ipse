import { describe, expect, it, vi } from 'vitest';
import type { RequestEvent } from '@sveltejs/kit';
import { cachedJson } from './edgeCache';

function cacheFixture(initial: Record<string, Response> = {}) {
  const entries = new Map(Object.entries(initial));
  const pending: Promise<void>[] = [];
  const cache = {
    match: vi.fn(async (key: string) => entries.get(key)?.clone()),
    put: vi.fn(async (key: string, response: Response) => {
      entries.set(key, response.clone());
    }),
  };
  const event = (url: string) =>
    ({
      url: new URL(url),
      platform: {
        caches: { default: cache },
        ctx: { waitUntil: (promise: Promise<void>) => pending.push(promise) },
      },
    }) as unknown as Pick<RequestEvent, 'url' | 'platform'>;
  return { cache, event, pending };
}

describe('versioned edge responses', () => {
  it('replaces old work representations without letting query variants fan out upstream', async () => {
    const base = 'https://example.com/api/opus-works';
    const fixture = cacheFixture({ [base]: Response.json({ quality: 75 }) });
    const load = vi.fn(async () => ({ body: { quality: 88 }, ok: true }));

    const response = await cachedJson(
      fixture.event(`${base}?v=images-2`),
      load,
      undefined,
      'images-2'
    );
    await Promise.all(fixture.pending);
    const cached = await cachedJson(
      fixture.event(`${base}?v=images-2&junk=1`),
      load,
      undefined,
      'images-2'
    );

    expect(await response.json()).toEqual({ quality: 88 });
    expect(await cached.json()).toEqual({ quality: 88 });
    expect(load).toHaveBeenCalledTimes(1);
    expect(fixture.cache.match).toHaveBeenLastCalledWith(`${base}?v=images-2`);
  });

  it('preserves unversioned caches for other endpoints', async () => {
    const base = 'https://example.com/api/github/stats';
    const fixture = cacheFixture({ [base]: Response.json({ stars: 12 }) });
    const load = vi.fn(async () => ({ body: {}, ok: true }));

    const response = await cachedJson(fixture.event(`${base}?junk=1`), load);

    expect(await response.json()).toEqual({ stars: 12 });
    expect(load).not.toHaveBeenCalled();
  });

  it('does not cache failed versioned loads', async () => {
    const fixture = cacheFixture();
    const response = await cachedJson(
      fixture.event('https://example.com/api/opus-works?v=images-2'),
      async () => ({ body: {}, ok: false }),
      undefined,
      'images-2'
    );

    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(fixture.cache.put).not.toHaveBeenCalled();
  });
});
