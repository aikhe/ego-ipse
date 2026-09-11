export type WorkPreview = 1 | 2 | 3 | 4;

export interface WorkMeta {
  k: string;
  v: string;
}

export interface WorkCell {
  src?: string;
  alt?: string;
  span?: 'wide';
  ratio?: string;
  h?: string;
  width?: number;
  height?: number;
}

export interface WorkQuote {
  text: string;
  by: string;
  href?: string;
  avatar?: string;
}

export interface Work {
  title: string;
  slug: string;
  description: string;
  preview: WorkPreview;
  cells?: WorkCell[];
  images?: WorkCell[];
  quote?: WorkQuote;
  meta: WorkMeta[];
}

// fully Sanity-driven - seeded via apps/studio/scripts/seed-selected-works.mjs
// and seed-works-aikhe.mjs. Kept as empty fallbacks for the merge in the opus routes.
export const selectedWorks: Work[] = [];

export const works: Work[] = [];

export const allWorks: Work[] = [...selectedWorks, ...works];

export function getWorkBySlug(slug: string): Work | undefined {
  return allWorks.find((work) => work.slug === slug);
}

export function getWorkSlugs(): string[] {
  return allWorks.map((work) => work.slug);
}
