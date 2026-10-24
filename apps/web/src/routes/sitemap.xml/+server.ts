import { fetchSanityOpusWorks } from '$lib/sanity/opusWorks';
import { SITE_URL } from '$lib/site';
import { SECURITY_HEADERS } from '$lib/server/securityHeaders';
import type { RequestHandler } from './$types';

const PAGES = [
  '',
  '/about',
  '/works',
  '/services',
  '/stack',
  '/blogs',
  '/fleur',
  '/kaia',
  '/knots',
  '/nvim',
  '/osn',
];

// public pages plus one entry per sanity work, so new works need no rebuild.
export const GET: RequestHandler = async ({ fetch }) => {
  const { sanitySelected, sanityWorks } = await fetchSanityOpusWorks(fetch);
  const paths = [
    ...PAGES,
    ...[...sanitySelected, ...sanityWorks].map(w => `/works/${w.slug}`),
  ];
  const urls = paths
    .map(path => `  <url><loc>${SITE_URL}${path}</loc></url>`)
    .join('\n');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    {
      headers: {
        ...SECURITY_HEADERS,
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=300, s-maxage=3600',
      },
    }
  );
};
