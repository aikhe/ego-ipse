import ike from '$lib/assets/ike.png';
import tarsi1 from '$lib/assets/works/tarsi-1.png';
import tarsi2 from '$lib/assets/works/tarsi-2.png';

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
}

export interface WorkQuote {
  text: string;
  by: string;
  href?: string;
  avatar?: string;
}

export interface Work {
  title: string;
  preview: WorkPreview;
  cells?: WorkCell[];
  quote?: WorkQuote;
  meta: WorkMeta[];
}

export const works: Work[] = [
  {
    title: 'Aurora Mark',
    preview: 2,
    cells: [
      { src: tarsi1, alt: 'Tarsi project preview one' },
      { src: tarsi2, alt: 'Tarsi project preview two' },
    ],
    quote: {
      text: 'Sharp, simple, unmistakably ours.',
      by: 'North Bureau',
      avatar: ike,
    },
    meta: [
      { k: 'Role', v: 'Brand Identity' },
      { k: 'Year', v: '2025' },
      { k: 'Stack', v: 'Figma, Illustrator' },
      { k: 'Status', v: 'Concept' },
    ],
  },
  {
    title: 'Paperfolio',
    preview: 2,
    meta: [
      { k: 'Role', v: 'Design & Development' },
      { k: 'Year', v: '2025' },
      { k: 'Stack', v: 'SvelteKit, Sanity' },
      { k: 'Status', v: 'In progress' },
    ],
  },
  {
    title: 'Gem Smoke',
    preview: 3,
    cells: [{}, {}, { span: 'wide', h: '18rem' }],
    meta: [
      { k: 'Role', v: 'Creative Development' },
      { k: 'Year', v: '2024' },
      { k: 'Stack', v: 'SvelteKit, Threlte' },
      { k: 'Status', v: 'Shipped' },
    ],
  },
  {
    title: 'Ipse Archive',
    preview: 4,
    meta: [
      { k: 'Role', v: 'Design Engineering' },
      { k: 'Year', v: '2025' },
      { k: 'Stack', v: 'SvelteKit, GSAP' },
      { k: 'Status', v: 'Concept' },
    ],
  },
];
