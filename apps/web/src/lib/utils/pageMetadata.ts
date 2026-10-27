import type { SanityOpusDescription } from '$lib/types/sanity';
import type { Work } from '$lib/types/work';

const SITE_NAME = 'Ike Rosacay';
const DEFAULT_DESCRIPTION =
  'Designer & Developer based in Caloocan, Philippines. Freelancing since 2025.';

type DescriptionKey =
  | 'sanityAbout'
  | 'sanityServices'
  | 'sanityStack'
  | 'sanityBlogs'
  | 'sanityFleur'
  | 'sanityKaia'
  | 'sanityKnots'
  | 'sanityNvim'
  | 'sanityOsn';

type MetadataData = Partial<
  Record<DescriptionKey, SanityOpusDescription | null>
> & {
  work?: Work;
  sanitySelected?: Work[];
  sanityWorks?: Work[];
};

const PAGES: Record<string, { title: string; content?: DescriptionKey }> = {
  '/about': { title: 'About', content: 'sanityAbout' },
  '/works': { title: 'Works' },
  '/services': { title: 'Services', content: 'sanityServices' },
  '/stack': { title: 'Stack', content: 'sanityStack' },
  '/blogs': { title: 'Blogs', content: 'sanityBlogs' },
  '/fleur': { title: 'Fleur', content: 'sanityFleur' },
  '/kaia': { title: 'Kaia', content: 'sanityKaia' },
  '/knots': { title: 'Knots', content: 'sanityKnots' },
  '/nvim': { title: 'Nvim', content: 'sanityNvim' },
  '/osn': { title: 'Osn', content: 'sanityOsn' },
  '/ipse': { title: 'Ipse' },
};

// reuse the first visible paragraph without the inline emphasis markers.
function plainDescription(description = ''): string {
  return (description.trim().split(/\r?\n\s*\r?\n/, 1)[0] ?? '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getPageMetadata(pathname: string, data: MetadataData = {}) {
  const path = pathname.replace(/\/+$/, '') || '/';
  const page = PAGES[path];
  const work = path.startsWith('/works/') ? data.work : undefined;
  const label = work?.title || page?.title;
  const title =
    path === '/'
      ? `${SITE_NAME} - Designer & Developer`
      : label
        ? `${label} - ${SITE_NAME}`
        : SITE_NAME;
  let description = plainDescription(
    work?.description ||
      (page?.content && data[page.content]?.description) ||
      ''
  );

  if (path === '/works') {
    const titles = [
      ...new Set(
        [...(data.sanitySelected ?? []), ...(data.sanityWorks ?? [])]
          .map(work => plainDescription(work.title))
          .filter(Boolean)
      ),
    ];
    if (titles.length > 0)
      description = `Works by ${SITE_NAME}: ${titles.join(', ')}.`;
  }

  return { title, description: description || DEFAULT_DESCRIPTION };
}
