import { describe, expect, it } from 'vitest';
import type { RequestEvent } from '@sveltejs/kit';
import { handle } from './hooks.server';

const event = {} as RequestEvent;

describe('response policies', () => {
  it('prevents proxy script injection on html without making nonce responses publicly cacheable', async () => {
    const response = await handle({
      event,
      resolve: async () =>
        new Response('<!doctype html>', {
          headers: { 'content-type': 'text/html; charset=utf-8' },
        }),
    });

    expect(response.headers.get('cache-control')).toBe(
      'private, no-cache, no-transform'
    );
  });

  it('preserves explicit cache restrictions and the generated csp', async () => {
    const csp = "script-src 'self' 'nonce-test'";
    const response = await handle({
      event,
      resolve: async () =>
        new Response('<!doctype html>', {
          headers: {
            'content-type': 'text/html',
            'cache-control': 'private, no-store',
            'content-security-policy': csp,
          },
        }),
    });

    expect(response.headers.get('cache-control')).toBe(
      'private, no-store, no-transform'
    );
    expect(response.headers.get('content-security-policy')).toBe(csp);
  });

  it('keeps api cache lifetimes intact', async () => {
    const cacheControl = 'public, max-age=300, s-maxage=3600';
    const response = await handle({
      event,
      resolve: async () =>
        Response.json(
          {},
          {
            headers: { 'cache-control': cacheControl },
          }
        ),
    });

    expect(response.headers.get('cache-control')).toBe(cacheControl);
    expect(response.headers.get('permissions-policy')).not.toMatch(
      /private-aggregation|attribution-reporting/
    );
  });
});
