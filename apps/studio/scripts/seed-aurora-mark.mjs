// Seeds the hardcoded "Aurora Mark" selected work into Sanity as an `opusWork` doc.
// Run:  $env:SANITY_TOKEN="<editor-token>"; node scripts/seed-aurora-mark.mjs
// Token: Sanity Manage -> API -> Tokens (Editor write access, production dataset).
// Rerunnable: uses createIfNotExists on _id `opusWork-aurora-mark`.

import {readFile} from 'node:fs/promises'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const PROJECT_ID = 'dn2lfgdt'
const DATASET = 'production'
const API_VERSION = 'v2022-03-07'
const DOC_ID = 'opusWork-aurora-mark'

const TOKEN = process.env.SANITY_TOKEN?.trim()
if (!TOKEN) {
  console.error('Missing SANITY_TOKEN. Create an Editor token and retry.')
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
  // asset._id looks like `image-<hash>-<w>x<h>-webp`
  return {_type: 'image', asset: {_type: 'reference', _ref: asset._id ?? asset.document?._id}}
}

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
  path.join(webAssets, 'works', 'tarsi-1.webp'),
  'aurora-tarsi-1.webp',
)
const tarsi2 = await uploadImage(
  path.join(webAssets, 'works', 'tarsi-2.webp'),
  'aurora-tarsi-2.webp',
)
const tarsi3 = await uploadImage(
  path.join(webAssets, 'works', 'tarsi-3.webp'),
  'aurora-tarsi-3.webp',
)
const avatar = await uploadImage(path.join(webAssets, 'ike.webp'), 'aurora-quote-avatar.webp')

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
console.log('Seeded opusWork aurora-mark:', await mutateRes.json())
console.log('Verify: *[_type=="opusWork" && slug.current=="aurora-mark"]')
