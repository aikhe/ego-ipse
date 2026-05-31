export interface Social {
  name: string;
  href: string;
  external: boolean;
  handle?: string;
  bioPrefix?: string;
  bioHighlight?: string;
  stats?: { label: string; value: string }[];
  tags?: string[];
  status?: string;
  image?: string;
}
