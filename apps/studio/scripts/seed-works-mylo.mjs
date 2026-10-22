// Seeds "Mylo" into Sanity as a regular (non-selected) `opusWork` doc.
// Run:  bun --env-file=.env.local scripts/seed-works-mylo.mjs  (from apps/studio)
// Rerunnable: uses createIfNotExists. selected=false, order=2 (after Aikhe).
// Preview cells = 1-2, detail gallery = 1-5. All sources 3000x3000 webp.

import path from 'node:path'
import {mutate, uploadImage, seedAssets} from './_client.mjs'

const DOC_ID = 'opusWork-mylo'

const myloDir = path.join(seedAssets, 'works', 'mylo')

const DESCRIPTION =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'

const WIDTH = 3000
const HEIGHT = 3000
const RATIO = '1 / 1'

function cell(image, key, alt, wide) {
  return {
    _type: 'object',
    _key: key,
    image,
    alt,
    wide,
    ratio: RATIO,
    width: WIDTH,
    height: HEIGHT,
  }
}

const numbers = ['one', 'two', 'three', 'four', 'five']
const images = {}
for (const [index, word] of numbers.entries()) {
  const n = index + 1
  images[n] = await uploadImage(path.join(myloDir, `${n}.webp`), `mylo-${n}.webp`)
  console.log(`Uploaded mylo/${n}.webp (${word})`)
}

// Preview grid is 2 columns with preview=4: wide cells span both columns,
// so the 2 preview images stack one per row.
const cells = [
  cell(images[1], 'preview-one', 'Mylo project preview one', true),
  cell(images[2], 'preview-two', 'Mylo project preview two', true),
]

const gallery = numbers.map((word, index) => {
  const n = index + 1
  // Detail gallery stays a 2-column grid.
  return cell(images[n], `gallery-${word}`, `Mylo project preview ${word}`, false)
})

const doc = {
  _id: DOC_ID,
  _type: 'opusWork',
  title: 'Mylo',
  slug: {_type: 'slug', current: 'mylo'},
  description: DESCRIPTION,
  selected: false,
  order: 2,
  preview: 4,
  cells,
  gallery,
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
console.log('Seeded opusWork mylo:', mutateRes)
console.log('Verify: *[_type=="opusWork" && slug.current=="mylo"]')
