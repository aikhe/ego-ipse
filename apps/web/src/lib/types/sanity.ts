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

interface SanityOpusWorkQuote {
  text?: string;
  by?: string;
  href?: string;
  avatar?: string;
}

interface SanityOpusWorkMeta {
  role?: string;
  platform?: string;
  year?: string;
  stack?: string;
  status?: string;
}

interface SanityOpusWorkMetaLegacyItem {
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

interface SanityOpusValuesColumn {
  title?: string;
  items?: string[];
}

interface SanityOpusValuesQuote {
  text?: string;
  by?: string;
}

export interface SanityOpusValues {
  description?: string;
  columns?: SanityOpusValuesColumn[];
  quote?: SanityOpusValuesQuote;
}

// about, blogs, kaia and services are description-only documents.
export interface SanityOpusDescription {
  description?: string;
}

export interface SanityOpusImage {
  src?: string;
  alt?: string;
  assetWidth?: number;
  assetHeight?: number;
  width?: number;
  height?: number;
}

// knots and osn; fleur extends it.
export interface SanityOpusGallery extends SanityOpusDescription {
  images?: SanityOpusImage[];
}

// plugin / misc / extra entries that link to a repo.
export interface SanityOpusRepoLink {
  title?: string;
  description?: string;
  repo?: string;
}

export interface SanityOpusFleur extends SanityOpusGallery {
  extras?: SanityOpusRepoLink[];
}

interface SanityOpusNvimConfigCard {
  title?: string;
  description?: string;
}

export interface SanityOpusNvim extends SanityOpusDescription {
  configCard?: SanityOpusNvimConfigCard;
  plugins?: SanityOpusRepoLink[];
  miscs?: SanityOpusRepoLink[];
}

interface SanityOpusStackItem {
  name?: string;
  href?: string;
  size?: number;
  iconLightUrl?: string;
  iconDarkUrl?: string;
}

export interface SanityOpusStackCategory {
  title?: string;
  items?: SanityOpusStackItem[];
}

export interface SanityOpusStack extends SanityOpusDescription {
  categories?: SanityOpusStackCategory[];
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
  index?: number;
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
  index?: number;
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
