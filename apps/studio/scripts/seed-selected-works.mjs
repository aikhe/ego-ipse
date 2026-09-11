// Seeds all remaining hardcoded selected works into Sanity as `opusWork` docs.
// Run:  node --env-file=.env.local scripts/seed-selected-works.mjs  (from apps/studio)
// Rerunnable: uses createIfNotExists per doc. Orders 3-11 preserve hardcoded
// display order (1 = Tarsi Redesign, 2 = Paperfolio, already seeded).

import {readFile} from 'node:fs/promises'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const PROJECT_ID = 'dn2lfgdt'
const DATASET = 'production'
const API_VERSION = 'v2022-03-07'

const TOKEN = process.env.SANITY_TOKEN?.trim()
if (!TOKEN) {
  console.error('Missing SANITY_TOKEN. Add it to .env.local and retry.')
  process.exit(1)
}

const here = path.dirname(fileURLToPath(import.meta.url))
const worksDir = path.resolve(here, '..', '..', 'web', 'src', 'lib', 'assets', 'works')

const DESCRIPTION =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'

// [file, alt, wide, width, height, ratio]
const WORKS = [
  {
    id: 'opusWork-ipse-archive',
    title: 'Ipse Archive',
    slug: 'ipse-archive',
    order: 3,
    preview: 4,
    meta: [
      ['role', 'Role', 'Design Engineering'],
      ['platform', 'Platform', 'Web App'],
      ['year', 'Year', '2025'],
      ['stack', 'Stack', 'SvelteKit, GSAP'],
      ['status', 'Status', 'Concept'],
    ],
    cells: [
      ['uni/1.webp', 'Uni project preview one', true, 2250, 2250, '1 / 1'],
      ['uni/2.webp', 'Uni project preview two', true, 1800, 2250, '4 / 5'],
    ],
  },
  {
    id: 'opusWork-uccingo',
    title: 'Uccingo',
    slug: 'uccingo',
    order: 4,
    preview: 4,
    meta: [
      ['role', 'Role', 'Design & Development'],
      ['platform', 'Platform', 'Web App'],
      ['year', 'Year', '2026'],
      ['stack', 'Stack', 'SvelteKit, Sanity'],
      ['status', 'Status', 'In progress'],
    ],
    cells: [
      ['uccingo/1.webp', 'Uccingo project preview one', true, 1220, 1220, '1 / 1'],
      ['uccingo/4.webp', 'Uccingo project preview four', true, 7896, 4536, '16 / 9'],
    ],
  },
  {
    id: 'opusWork-sola',
    title: 'Sola',
    slug: 'sola',
    order: 5,
    preview: 4,
    meta: [
      ['role', 'Role', 'Design & Development'],
      ['platform', 'Platform', 'Mobile App'],
      ['year', 'Year', '2026'],
      ['stack', 'Stack', 'SvelteKit, Sanity'],
      ['status', 'Status', 'In progress'],
    ],
    cells: [
      ['sola/1.webp', 'Sola project preview one', true, 1920, 1080, '16 / 9'],
      ['sola/2.webp', 'Sola project preview two', false, 1920, 1080, '16 / 9'],
      ['sola/5.webp', 'Sola project preview five', false, 1920, 1080, '16 / 9'],
      ['sola/4.webp', 'Sola project preview four', false, 1920, 1080, '16 / 9'],
      ['sola/3.webp', 'Sola project preview three', false, 1920, 1080, '16 / 9'],
    ],
  },
  {
    id: 'opusWork-klaro',
    title: 'Klaro',
    slug: 'klaro',
    order: 6,
    preview: 4,
    meta: [
      ['role', 'Role', 'Design & Development'],
      ['platform', 'Platform', 'Web App'],
      ['year', 'Year', '2026'],
      ['stack', 'Stack', 'SvelteKit, Sanity'],
      ['status', 'Status', 'In progress'],
    ],
    cells: [
      ['klaro/1.webp', 'Klaro project preview one', true, 1920, 1080, '16 / 9'],
      ['klaro/3.webp', 'Klaro project preview three', false, 1920, 1080, '16 / 9'],
      ['klaro/4.webp', 'Klaro project preview four', false, 1920, 1080, '16 / 9'],
      ['klaro/2.webp', 'Klaro project preview two', true, 1920, 1080, '16 / 9'],
    ],
  },
  {
    id: 'opusWork-gem-smoke',
    title: 'Gem Smoke',
    slug: 'gem-smoke',
    order: 7,
    preview: 1,
    meta: [
      ['role', 'Role', 'Creative Development'],
      ['platform', 'Platform', 'Web App'],
      ['year', 'Year', '2024'],
      ['stack', 'Stack', 'SvelteKit, Threlte'],
      ['status', 'Status', 'Shipped'],
    ],
    cells: [['mini-notion.webp', 'Mini notion preview', false, 2400, 2271, '1 / 1']],
  },
  {
    id: 'opusWork-osn',
    title: 'Osn',
    slug: 'osn',
    order: 8,
    preview: 1,
    meta: [
      ['role', 'Role', 'Design & Development'],
      ['platform', 'Platform', 'Web App'],
      ['year', 'Year', '2026'],
      ['stack', 'Stack', 'SvelteKit, Sanity'],
      ['status', 'Status', 'In progress'],
    ],
    cells: [
      ['osn/1.webp', 'Osn project preview', false, 1529, 991, '3 / 2'],
      ['osn/2.webp', 'Osn project preview two', false, 3390, 1288, '8 / 3'],
    ],
  },
  {
    id: 'opusWork-habi',
    title: 'Habi',
    slug: 'habi',
    order: 9,
    preview: 4,
    meta: [
      ['role', 'Role', 'Design & Development'],
      ['platform', 'Platform', 'Web App'],
      ['year', 'Year', '2026'],
      ['stack', 'Stack', 'SvelteKit, Sanity'],
      ['status', 'Status', 'In progress'],
    ],
    cells: [
      ['habi/1.webp', 'Habi project preview one', true, 3078, 1994, '3 / 2'],
      ['habi/2.webp', 'Habi project preview two', true, 3816, 1994, '2 / 1'],
    ],
  },
  {
    id: 'opusWork-bananasplit',
    title: 'Bananasplit',
    slug: 'bananasplit',
    order: 10,
    preview: 1,
    meta: [
      ['role', 'Role', 'Design & Development'],
      ['platform', 'Platform', 'Mobile App'],
      ['year', 'Year', '2026'],
      ['stack', 'Stack', 'SvelteKit, Sanity'],
      ['status', 'Status', 'In progress'],
    ],
    cells: [['bananasplit/1.webp', 'Bananasplit project preview', false, 2400, 1555, '3 / 2']],
  },
  {
    id: 'opusWork-katha',
    title: 'Katha',
    slug: 'katha',
    order: 11,
    preview: 4,
    meta: [
      ['role', 'Role', 'Design & Development'],
      ['platform', 'Platform', 'Web App'],
      ['year', 'Year', '2026'],
      ['stack', 'Stack', 'SvelteKit, Sanity'],
      ['status', 'Status', 'In progress'],
    ],
    cells: [
      ['katha/1.webp', 'Katha project preview one', true, 1920, 1080, '16 / 9'],
      ['katha/2.webp', 'Katha project preview two', false, 1920, 1080, '16 / 9'],
      ['katha/3.webp', 'Katha project preview three', false, 1920, 1080, '16 / 9'],
      ['katha/4.webp', 'Katha project preview four', false, 1920, 1080, '16 / 9'],
      ['katha/5.webp', 'Katha project preview five', false, 1920, 1080, '16 / 9'],
      ['katha/6.webp', 'Katha project preview six', false, 1920, 1080, '16 / 9'],
      ['katha/7.webp', 'Katha project preview seven', false, 1920, 1080, '16 / 9'],
    ],
  },
]

const assetCache = new Map()

async function uploadImage(file) {
  if (assetCache.has(file)) return assetCache.get(file)
  const buf = await readFile(path.join(worksDir, file))
  const res = await fetch(
    `https://${PROJECT_ID}.api.sanity.io/${API_VERSION}/assets/images/${DATASET}?filename=${encodeURIComponent(path.basename(file))}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'image/webp',
      },
      body: buf,
    },
  )
  if (!res.ok) throw new Error(`Upload failed for ${file}: ${await res.text()}`)
  const asset = await res.json()
  const ref = {_type: 'image', asset: {_type: 'reference', _ref: asset._id ?? asset.document?._id}}
  assetCache.set(file, ref)
  console.log(`Uploaded ${file}`)
  return ref
}

const mutations = []
for (const work of WORKS) {
  const cells = []
  for (const [index, [file, alt, wide, width, height, ratio]] of work.cells.entries()) {
    const image = await uploadImage(file)
    cells.push({_type: 'object', _key: `cell-${index + 1}`, image, alt, wide, ratio, width, height})
  }
  mutations.push({
    createIfNotExists: {
      _id: work.id,
      _type: 'opusWork',
      title: work.title,
      slug: {_type: 'slug', current: work.slug},
      description: DESCRIPTION,
      selected: true,
      order: work.order,
      preview: work.preview,
      cells,
      gallery: cells,
      meta: {
        _type: 'object',
        ...Object.fromEntries(work.meta.map(([key, , v]) => [key, v])),
      },
    },
  })
}

const mutateRes = await fetch(
  `https://${PROJECT_ID}.api.sanity.io/${API_VERSION}/data/mutate/${DATASET}`,
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({mutations}),
  },
)
if (!mutateRes.ok) throw new Error(`Mutate failed: ${await mutateRes.text()}`)
console.log('Seeded selected works:', await mutateRes.json())
