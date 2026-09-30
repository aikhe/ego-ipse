import type { PageServerLoad } from './$types';
import type { SanityOpusBlogs } from '$lib/types/sanity';

export const prerender = false;

// Same-origin API (see src/routes/api/opus-blogs): Sanity is fetched
// server-side so phones never need to reach api.sanity.io directly.
async function getJson<T>(
  fetchFn: typeof fetch,
  url: string
): Promise<T | null> {
  try {
    const res = await fetchFn(url);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export const load: PageServerLoad = async ({ fetch }) => {
  const blogsData = await getJson<{ sanityBlogs?: SanityOpusBlogs | null }>(
    fetch,
    '/api/opus-blogs'
  );
  return {
    sanityBlogs: blogsData?.sanityBlogs ?? null,
  };
};
