// Seeds the hardcoded "Aurora Mark" selected work into Sanity as an `opusWork` doc.
// Run:  bun --env-file=.env.local scripts/seed-aurora-mark.mjs  (from apps/studio)
// Rerunnable: uses createIfNotExists on _id `opusWork-aurora-mark`.

import path from 'node:path'
import {mutate, uploadImage, seedAssets} from './_client.mjs'

const DOC_ID = 'opusWork-aurora-mark'

const DESCRIPTION =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'

function cell(image, alt) {
  return {
    _type: 'object',
    _key: `${alt.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`,
    image,
    alt,
    wide: true,
    ratio: '2 / 1',
    width: 2400,
    height: 1200,
  }
}

const tarsi1 = await uploadImage(
  path.join(seedAssets, 'works', 'tarsi', 'tarsi-1.webp'),
  'aurora-tarsi-1.webp',
)
const tarsi2 = await uploadImage(
  path.join(seedAssets, 'works', 'tarsi', 'tarsi-2.webp'),
  'aurora-tarsi-2.webp',
)
const tarsi3 = await uploadImage(
  path.join(seedAssets, 'works', 'tarsi', 'tarsi-3.webp'),
  'aurora-tarsi-3.webp',
)
const avatar = await uploadImage(path.join(seedAssets, 'ike.webp'), 'aurora-quote-avatar.webp')

const doc = {
  _id: DOC_ID,
  _type: 'opusWork',
  title: 'Aurora Mark',
  slug: {_type: 'slug', current: 'aurora-mark'},
  description: DESCRIPTION,
  selected: true,
  order: 1,
  preview: 2,
  cells: [
    cell(tarsi1, 'Tarsi project preview one'),
    cell(tarsi2, 'Tarsi project preview two'),
    cell(tarsi3, 'Tarsi project preview three'),
  ],
  gallery: [
    cell(tarsi1, 'Tarsi project preview one'),
    cell(tarsi2, 'Tarsi project preview two'),
    cell(tarsi3, 'Tarsi project preview three'),
  ],
  quote: {
    _type: 'object',
    text: 'Sharp, simple, unmistakably ours.',
    by: 'North Bureau',
    avatar,
  },
  meta: {
    _type: 'object',
    role: 'Brand Identity',
    platform: 'Mobile App',
    year: '2025',
    stack: 'Figma, Illustrator',
    status: 'Concept',
  },
}

const mutateRes = await mutate([{createIfNotExists: doc}])
console.log('Seeded opusWork aurora-mark:', mutateRes)
console.log('Verify: *[_type=="opusWork" && slug.current=="aurora-mark"]')
