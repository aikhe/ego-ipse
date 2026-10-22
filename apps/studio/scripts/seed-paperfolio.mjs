// Seeds the hardcoded "Paperfolio" selected work into Sanity as an `opusWork` doc.
// Run:  bun --env-file=.env.local scripts/seed-paperfolio.mjs  (from apps/studio)

import path from 'node:path'
import {mutate, uploadImage, seedAssets} from './_client.mjs'

const DOC_ID = 'opusWork-paperfolio'

const DESCRIPTION =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'

const img1 = await uploadImage(
  path.join(seedAssets, 'works', 'uccingo-1.webp'),
  'paperfolio-1.webp',
)
const img2 = await uploadImage(
  path.join(seedAssets, 'works', 'uccingo-2.webp'),
  'paperfolio-2.webp',
)
const img3 = await uploadImage(
  path.join(seedAssets, 'works', 'uccingo-3.webp'),
  'paperfolio-3.webp',
)

function cell(image, key, alt, wide, width, height, ratio) {
  return {
    _type: 'object',
    _key: key,
    image,
    alt,
    wide,
    ratio,
    width,
    height,
  }
}

const cells = [
  cell(img1, 'preview-one', 'Uccingo project preview one', true, 2053, 1380, '3 / 2'),
  cell(img2, 'preview-two', 'Uccingo project preview two', false, 1430, 1380, '1 / 1'),
  cell(img3, 'preview-three', 'Uccingo project preview three', false, 1430, 1380, '1 / 1'),
]

const doc = {
  _id: DOC_ID,
  _type: 'opusWork',
  title: 'Paperfolio',
  slug: {_type: 'slug', current: 'paperfolio'},
  description: DESCRIPTION,
  selected: true,
  order: 2,
  preview: 4,
  cells,
  gallery: cells,
  meta: {
    _type: 'object',
    role: 'Design & Development',
    platform: 'Poster',
    year: '2025',
    stack: 'SvelteKit, Sanity',
    status: 'In progress',
  },
}

const mutateRes = await mutate([{createIfNotExists: doc}])
console.log('Seeded opusWork paperfolio:', mutateRes)
console.log('Verify: *[_type=="opusWork" && slug.current=="paperfolio"]')
