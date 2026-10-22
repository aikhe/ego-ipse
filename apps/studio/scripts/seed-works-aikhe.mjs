// Seeds the last hardcoded regular work ("Aikhe") into Sanity as an `opusWork` doc.
// Run:  bun --env-file=.env.local scripts/seed-works-aikhe.mjs  (from apps/studio)
// Rerunnable: uses createIfNotExists. selected=false, order=1 (first in Works list).

import path from 'node:path'
import {mutate, uploadImage, seedAssets} from './_client.mjs'

const DOC_ID = 'opusWork-aikhe'

const aikheDir = path.join(seedAssets, 'works', 'aikhe')

const DESCRIPTION =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'

const img3 = await uploadImage(path.join(aikheDir, '3.webp'), 'aikhe-3.webp')
const img4 = await uploadImage(path.join(aikheDir, '4.webp'), 'aikhe-4.webp')

function cell(image, key, alt) {
  return {
    _type: 'object',
    _key: key,
    image,
    alt,
    wide: true,
    ratio: '8 / 5',
    width: 4188,
    height: 2588,
  }
}

const cells = [
  cell(img3, 'preview-three', 'Aikhe project preview three'),
  cell(img4, 'preview-four', 'Aikhe project preview four'),
]

const doc = {
  _id: DOC_ID,
  _type: 'opusWork',
  title: 'Aikhe',
  slug: {_type: 'slug', current: 'aikhe'},
  description: DESCRIPTION,
  selected: false,
  order: 1,
  preview: 4,
  cells,
  gallery: cells,
  meta: {
    _type: 'object',
    role: 'Design & Development',
    platform: 'Web App',
    year: '2026',
    stack: 'SvelteKit, Sanity',
    status: 'In progress',
  },
}

const mutateRes = await mutate([{createIfNotExists: doc}])
console.log('Seeded opusWork aikhe:', mutateRes)
console.log('Verify: *[_type=="opusWork" && slug.current=="aikhe"]')
