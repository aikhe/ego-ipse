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
