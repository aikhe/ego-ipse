// Seeds the last hardcoded regular work ("Aikhe") into Sanity as an `opusWork` doc.
// Run:  node --env-file=.env.local scripts/seed-works-aikhe.mjs  (from apps/studio)
// Rerunnable: uses createIfNotExists. selected=false, order=1 (first in Works list).

import {readFile} from 'node:fs/promises'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const PROJECT_ID = 'dn2lfgdt'
const DATASET = 'production'
const API_VERSION = 'v2022-03-07'
const DOC_ID = 'opusWork-aikhe'

const TOKEN = process.env.SANITY_TOKEN?.trim()
if (!TOKEN) {
  console.error('Missing SANITY_TOKEN. Add it to .env.local and retry.')
  process.exit(1)
}

const here = path.dirname(fileURLToPath(import.meta.url))
const aikheDir = path.resolve(here, '..', '..', 'web', 'src', 'lib', 'assets', 'works', 'aikhe')

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
console.log('Seeded opusWork aikhe:', await mutateRes.json())
console.log('Verify: *[_type=="opusWork" && slug.current=="aikhe"]')
