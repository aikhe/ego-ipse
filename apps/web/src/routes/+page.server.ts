import type { PageServerLoad } from './$types';
import type { Project } from '$lib/types/project';
import type { Social } from '$lib/types/social';
import type { SanityProject, SanitySocial } from '$lib/types/sanity';

export const prerender = false;

const SANITY_URL =
  'https://dn2lfgdt.api.sanity.io/v2022-03-07/data/query/production';

export const load: PageServerLoad = async ({ fetch }) => {
  // ── Projects ──────────────────────────────────────────────
  const projectQuery = `*[_type == "workRoot"] | order(index asc) [0...5] {
    title,
    duration,
    brief,
    projectType,
    techStack,
    url,
    githubUrl,
    category,
    description,
    "imageUrl": cover.asset->url,
    tags,
    width,
    height,
    index
  }`;

  const projectUrl = `${SANITY_URL}?query=${encodeURIComponent(projectQuery)}`;
  const GRID_SIZE = 5;
  const slots: (Project | null)[] = Array(GRID_SIZE).fill(null);

  try {
    const res = await fetch(projectUrl);
    if (res.ok) {
      const data = (await res.json()) as { result?: SanityProject[] };
      const rawProjects = data.result || [];

      rawProjects.forEach((p: SanityProject) => {
        let dateStr = '';
        let idStr = '';
        if (p.duration?.start) {
          const start = new Date(p.duration.start);
          const startYear = start.getUTCFullYear();
          const startMonth = String(start.getUTCMonth() + 1).padStart(2, '0');
          const startYearShort = startYear % 100;

          if (p.duration.end) {
            const end = new Date(p.duration.end);
            const endYear = end.getUTCFullYear();
            const endMonth = String(end.getUTCMonth() + 1).padStart(2, '0');
            const endYearShort = endYear % 100;

            if (startYear === endYear && startMonth === endMonth) {
              dateStr = `${startMonth}.${startYear}`;
            } else {
              dateStr = `${startMonth}.${startYear} | ${endMonth}.${endYear}`;
            }

            if (startYear === endYear) {
              idStr = `${startYear}`;
            } else {
              idStr = `${startYearShort}-${endYearShort}`;
            }
          } else {
            dateStr = `${startMonth}.${startYear} | PRESENT`;
            const currentYear = new Date().getFullYear();
            if (startYear === currentYear) {
              idStr = `${startYear}`;
            } else {
              const currentYearShort = currentYear % 100;
              idStr = `${startYearShort}-${currentYearShort}`;
            }
          }
        }

        const slotIndex = Number(p.index ?? 0) - 1;
        if (slotIndex >= 0 && slotIndex < GRID_SIZE) {
          slots[slotIndex] = {
            name: p.title || '',
            section: (p.brief || '').toUpperCase(),
            date: dateStr,
            tags: p.tags || [],
            id: idStr,
            width: p.width || 320,
            height: p.height || 400,
            image: p.imageUrl || '',
            index: p.index ?? 0,
          };
        }
      });
    } else {
      console.error('Failed to fetch from Sanity', await res.text());
    }
  } catch (err) {
    console.error('Error fetching sanity data:', err);
  }

  const emptyProject = (): Project => ({
    name: '',
    section: '',
    date: '',
    tags: [],
    id: '',
    width: 320,
    height: 400,
    image: '',
    index: 0,
  });

  const projects: Project[] = slots.map(slot => slot ?? emptyProject());

  // ── Socials ───────────────────────────────────────────────
  const socialQuery = `*[_type == "social"] | order(index asc) [0...6] {
    name,
    href,
    external,
    handle,
    bioPrefix,
    bioHighlight,
    stats,
    tags,
    status,
    "imageUrl": image.asset->url,
    index
  }`;

  const SOCIAL_GRID = 6;
  const socialSlots: (Social | null)[] = Array(SOCIAL_GRID).fill(null);

  try {
    const res = await fetch(
      `${SANITY_URL}?query=${encodeURIComponent(socialQuery)}`
    );
    if (res.ok) {
      const data = (await res.json()) as { result?: SanitySocial[] };
      const rawSocials = data.result || [];

      rawSocials.forEach((s: SanitySocial) => {
        const slotIndex = Number(s.index ?? 1) - 1;
        if (slotIndex >= 0 && slotIndex < SOCIAL_GRID) {
          socialSlots[slotIndex] = {
            name: s.name || '',
            href: s.href || '',
            external: s.external ?? true,
            handle: s.handle,
            bioPrefix: s.bioPrefix,
            bioHighlight: s.bioHighlight,
            stats: s.stats,
            tags: s.tags,
            status: s.status,
            image: s.imageUrl || '',
          };
        }
      });
    } else {
      console.error('Failed to fetch socials from Sanity', await res.text());
    }
  } catch (err) {
    console.error('Error fetching socials data:', err);
  }

  const emptySocial = (): Social => ({
    name: '',
    href: '',
    external: true,
    handle: '',
    bioPrefix: '',
    bioHighlight: '',
    stats: [],
    tags: [],
    status: '',
    image: '',
  });

  const socials: Social[] = socialSlots.map(slot => slot ?? emptySocial());

  return {
    projects,
    socials,
  };
};
