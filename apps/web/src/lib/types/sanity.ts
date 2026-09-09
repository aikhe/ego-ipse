export interface SanityOpusWorkCell {
  src?: string;
  alt?: string;
  wide?: boolean;
  ratio?: string;
  width?: number;
  height?: number;
  assetWidth?: number;
  assetHeight?: number;
}

export interface SanityOpusWorkQuote {
  text?: string;
  by?: string;
  href?: string;
  avatar?: string;
}

export interface SanityOpusWorkMeta {
  role?: string;
  platform?: string;
  year?: string;
  stack?: string;
  status?: string;
}

export interface SanityOpusWorkMetaLegacyItem {
  k?: string;
  v?: string;
}

export interface SanityOpusWork {
  _id?: string;
  title?: string;
  slug?: string;
  description?: string;
  selected?: boolean;
  order?: number;
  preview?: number;
  cells?: SanityOpusWorkCell[];
  gallery?: SanityOpusWorkCell[];
  quote?: SanityOpusWorkQuote;
  meta?: SanityOpusWorkMeta | SanityOpusWorkMetaLegacyItem[];
}
export interface SanityOpusValuesColumn {
  title?: string;
  items?: string[];
}

export interface SanityOpusValuesQuote {
  text?: string;
  by?: string;
}

export interface SanityOpusValues {
  description?: string;
  columns?: SanityOpusValuesColumn[];
  quote?: SanityOpusValuesQuote;
}
export interface SanityProject {
  title?: string;
  duration?: {
    start?: string;
    end?: string;
  };
  brief?: string;
  projectType?: string;
  techStack?: string[];
  url?: string;
  githubUrl?: string;
  category?: string;
  description?: string;
  imageUrl?: string;
  tags?: string[];
  width?: number;
  height?: number;
  index?: string;
}

export interface SanitySocial {
  name?: string;
  href?: string;
  external?: boolean;
  handle?: string;
  bioPrefix?: string;
  bioHighlight?: string;
  stats?: { label: string; value: string }[];
  tags?: string[];
  status?: string;
  imageUrl?: string;
  index?: string;
}

export interface SanityGitHub {
  name?: string;
  href?: string;
  external?: boolean;
  handle?: string;
  bioPrefix?: string;
  bioHighlight?: string;
  tags?: string[];
  status?: string;
  imageUrl?: string;
}
