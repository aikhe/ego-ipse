import type { PageServerLoad } from './$types';
import type { Project } from '$lib/types/project';
import type { SanityProject } from '$lib/types/sanity';

export const prerender = false;

export const load: PageServerLoad = async ({ fetch }) => {
  const query = `*[_type == "workRoot"] | order(index asc) [0...5] {
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

  const url = `https://dn2lfgdt.api.sanity.io/v2022-03-07/data/query/production?query=${encodeURIComponent(query)}`;
  const projects: Project[] = [];

  try {
    const res = await fetch(url);
    if (res.ok) {
      const data = (await res.json()) as { result?: SanityProject[] };
      const rawProjects = data.result || [];

      rawProjects.forEach((p: SanityProject) => {
        // 1. Process Date
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
            // Ongoing / Present
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

        projects.push({
          name: p.title || '',
          section: (p.brief || '').toUpperCase(),
          date: dateStr,
          tags: p.tags || [],
          id: idStr,
          width: p.width || 320,
          height: p.height || 400,
          image: p.imageUrl || '',
          index: p.index ?? 0,
        });
      });
    } else {
      console.error('Failed to fetch from Sanity', await res.text());
    }
  } catch (err) {
    console.error('Error fetching sanity data:', err);
  }

  // Pad to exactly 5 elements with empty placeholders
  while (projects.length < 5) {
    projects.push({
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
  }

  return {
    projects,
  };
};
