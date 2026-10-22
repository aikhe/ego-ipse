type WorkPreview = 1 | 2 | 3 | 4;

interface WorkMeta {
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

interface WorkQuote {
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
