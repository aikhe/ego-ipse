// Seeds the Knots page copy into Sanity as an `opusKnots` doc with lorem
// placeholder copy, then attaches the same webp figures as the osn page
// (placeholder until knots art lands).
// Run:  bun --env-file=.env.local scripts/seed-opus-knots.mjs  (from apps/studio)
// Sources: ../seed-assets/works/osn/1.webp, 2.webp (same files as opusOsn).
// Rerunnable: createIfNotExists the doc, re-uploads assets then `set`s images.

import path from 'node:path'
import {mutate, uploadImage, seedAssets} from './_client.mjs'

const DOC_ID = 'opusKnots-singleton'

// lorem placeholder: blank line = new paragraph, **bold** only (no italics).
const DESCRIPTION =
  'Knots is **lorem ipsum dolor sit amet**, consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam.\n\nQuis nostrud **exercitation ullamco laboris** nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse.'

const doc = {
  _id: DOC_ID,
  _type: 'opusKnots',
  description: DESCRIPTION,
}

const osnDir = path.join(seedAssets, 'works', 'osn')

const createRes = await mutate([{createIfNotExists: doc}])
console.log('Seeded opusKnots:', createRes)

// same figures as the osn page for now.
const figures = [
  {file: '1.webp', key: 'fig-001', alt: 'Knots project preview'},
  {file: '2.webp', key: 'fig-002', alt: 'Knots project preview two'},
]

const images = []
for (const fig of figures) {
  const image = await uploadImage(path.join(osnDir, fig.file), `osn-${fig.file}`)
  console.log(`Uploaded osn/${fig.file}`)
  images.push({_type: 'object', _key: fig.key, image, alt: fig.alt})
}

const mutateRes = await mutate([{patch: {id: DOC_ID, set: {images}}}])
console.log('Attached figures to opusKnots:', mutateRes)
console.log('Verify: *[_type=="opusKnots"][0]{description, "images": images[]{alt}}')
