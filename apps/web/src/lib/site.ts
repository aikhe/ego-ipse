// the one public origin: canonical, og and sitemap urls never follow the request host,
// so pages.dev previews can't claim to be the original.
export const SITE_URL = 'https://ikerosacay.com';

// json-LD script tag for the home page; `<` is escaped so the payload can't close the tag.
export const SITE_JSON_LD_TAG = `<script type="application/ld+json">${JSON.stringify(
  {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: 'Ike Rosacay',
        alternateName: 'Ike Andrie Rosacay',
        inLanguage: 'en',
      },
      {
        '@type': 'Person',
        '@id': `${SITE_URL}/#person`,
        name: 'Ike Andrie Rosacay',
        alternateName: 'Ike Rosacay',
        url: SITE_URL,
        image: `${SITE_URL}/banner.webp`,
        jobTitle: 'Designer & Developer',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Caloocan',
          addressCountry: 'PH',
        },
        sameAs: ['https://github.com/aikhe', 'https://x.com/aikheandrie'],
      },
    ],
  }
).replace(/</g, '\\u003c')}</script>`;
