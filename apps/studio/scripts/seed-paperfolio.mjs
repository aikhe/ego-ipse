// Seeds the hardcoded "Paperfolio" selected work into Sanity as an `opusWork` doc.
// Run:  node --env-file=.env.local scripts/seed-paperfolio.mjs  (from apps/studio)
// Token: Editor write access, production dataset. Rerunnable via createIfNotExists.

import {readFile} from 'node:fs/promises'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const PROJECT_ID = 'dn2lfgdt'
const DATASET = 'production'
const API_VERSION = 'v2022-03-07'
const DOC_ID = 'opusWork-paperfolio'

const TOKEN = process.env.SANITY_TOKEN?.trim()
if (!TOKEN) {
  console.error('Missing SANITY_TOKEN. Add it to .env.local and retry.')
  process.exit(1)
}

const here = path.dirname(fileURLToPath(import.meta.url))
const webAssets = path.resolve(here, '..', '..', 'web', 'src', 'lib', 'assets')

const DESCRIPTION =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'

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

const img1 = await uploadImage(path.join(webAssets, 'works', 'uccingo-1.webp'), 'paperfolio-1.webp')
const img2 = await uploadImage(path.join(webAssets, 'works', 'uccingo-2.webp'), 'paperfolio-2.webp')
const img3 = await uploadImage(path.join(webAssets, 'works', 'uccingo-3.webp'), 'paperfolio-3.webp')

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
console.log('Seeded opusWork paperfolio:', await mutateRes.json())
console.log('Verify: *[_type=="opusWork" && slug.current=="paperfolio"]')
