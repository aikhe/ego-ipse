import { json, type RequestEvent } from '@sveltejs/kit';
import { SECURITY_HEADERS } from './securityHeaders';

const CACHE_CONTROL =
  'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400';

interface Loaded {
  body: unknown;
  // false for failures/empty results: sent as no-store and never cached.
  ok: boolean;
}

// the slice of the workers cache api used here, typed with the dom
// Response (workers-types' own Response clashes with it).
interface EdgeCache {
  match(key: string): Promise<Response | undefined>;
  put(key: string, res: Response): Promise<void>;
}

// stores successful responses by path and an optional representation version.
// the adapter worker already caches by full url, so without this every
// `?junk=n` variant would miss and fan out upstream. without a platform
// (vite dev) it just runs `load`.
export async function cachedJson(
  event: Pick<RequestEvent, 'url' | 'platform'>,
  load: () => Promise<Loaded>,
  cacheControl = CACHE_CONTROL,
  version?: string
): Promise<Response> {
  const cache = event.platform?.caches.default as unknown as
    EdgeCache | undefined;
  const key =
    event.url.origin +
    event.url.pathname +
    (version ? `?v=${encodeURIComponent(version)}` : '');

  const hit = await cache?.match(key);
  if (hit) {
    const res = new Response(hit.body, {
      status: hit.status,
      headers: hit.headers,
    });
    res.headers.set('x-edge-cache', 'HIT');
    return res;
  }

  const { body, ok } = await load();
  // security headers go in the stored copy: the adapter can serve a matching
  // entry directly without running hooks.
  const res = json(body, {
    headers: {
      ...SECURITY_HEADERS,
      'Cache-Control': ok ? cacheControl : 'no-store',
    },
  });
  if (ok && cache) event.platform?.ctx.waitUntil(cache.put(key, res.clone()));
  return res;
}
