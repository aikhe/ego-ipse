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
