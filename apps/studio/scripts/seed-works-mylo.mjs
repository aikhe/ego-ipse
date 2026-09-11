// Seeds "Mylo" into Sanity as a regular (non-selected) `opusWork` doc.
// Run:  node --env-file=.env.local scripts/seed-works-mylo.mjs  (from apps/studio)
// Rerunnable: uses createIfNotExists. selected=false, order=2 (after Aikhe).
// Preview cells = 1-2, detail gallery = 1-5. All sources 3000x3000 webp.

import {readFile} from 'node:fs/promises'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const PROJECT_ID = 'dn2lfgdt'
const DATASET = 'production'
const API_VERSION = 'v2022-03-07'
const DOC_ID = 'opusWork-mylo'

const TOKEN = process.env.SANITY_TOKEN?.trim()
if (!TOKEN) {
  console.error('Missing SANITY_TOKEN. Add it to .env.local and retry.')
  process.exit(1)
}

const here = path.dirname(fileURLToPath(import.meta.url))
const myloDir = path.resolve(here, '..', '..', 'web', 'src', 'lib', 'assets', 'works', 'mylo')

const DESCRIPTION =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'

const WIDTH = 3000
const HEIGHT = 3000
const RATIO = '1 / 1'

async function uploadImage(absPath, filename) {
  const buf = await readFile(absPath)
  const res = await fetch(
    `https://${PROJECT_ID}.api.sanity.io/${API_VERSION}/assets/images/${DATASET}?filename=${encodeURIComponent(filename)}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'image/webp',
      },
      body: buf,
    },
  )
  if (!res.ok) throw new Error(`Upload failed for ${filename}: ${await res.text()}`)
  const asset = await res.json()
  return {_type: 'image', asset: {_type: 'reference', _ref: asset._id ?? asset.document?._id}}
}

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

const mutateRes = await fetch(
  `https://${PROJECT_ID}.api.sanity.io/${API_VERSION}/data/mutate/${DATASET}`,
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({mutations: [{createIfNotExists: doc}]}),
  },
)
if (!mutateRes.ok) throw new Error(`Mutate failed: ${await mutateRes.text()}`)
console.log('Seeded opusWork mylo:', await mutateRes.json())
console.log('Verify: *[_type=="opusWork" && slug.current=="mylo"]')
