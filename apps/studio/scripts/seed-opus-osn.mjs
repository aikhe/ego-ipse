// Seeds the Osn page copy into Sanity as an `opusOsn` doc with lorem
// placeholder copy, then attaches the same webp figures as the selected works osn gallery.
// Run:  $env:SANITY_TOKEN="<editor-token>"; node scripts/seed-opus-osn.mjs
// Token: Sanity Manage -> API -> Tokens (Editor write access, production dataset).
// Sources: ../../web/src/lib/assets/works/osn/1.webp, 2.webp (same files as opusWork-osn).
// Rerunnable: createIfNotExists the doc, re-uploads assets then `set`s images.

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const PROJECT_ID = 'dn2lfgdt'
const DATASET = 'production'
const API_VERSION = 'v2022-03-07'
const DOC_ID = 'opusOsn-singleton'

const TOKEN = process.env.SANITY_TOKEN?.trim()
if (!TOKEN) {
  console.error('Missing SANITY_TOKEN. Create an Editor token and retry.')
  process.exit(1)
}

// lorem placeholder: blank line = new paragraph, **bold** + *italic*
// exercise the frontend's rich-inline rendering until real copy lands.
const DESCRIPTION =
  'Osn is **lorem ipsum dolor sit amet**, consectetur adipiscing elit sed do eiusmod *tempor incididunt* ut labore et dolore magna aliqua enim ad minim veniam.\n\nQuis nostrud **exercitation ullamco laboris** nisi ut aliquip ex ea commodo consequat duis aute *irure dolor* in reprehenderit in voluptate velit esse.'

const doc = {
  _id: DOC_ID,
  _type: 'opusOsn',
  description: DESCRIPTION,
}

const here = path.dirname(fileURLToPath(import.meta.url))
const osnDir = path.resolve(here, '..', '..', 'web', 'src', 'lib', 'assets', 'works', 'osn')

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
  return { _type: 'image', asset: { _type: 'reference', _ref: asset._id ?? asset.document?._id } }
}

const createRes = await fetch(
  `https://${PROJECT_ID}.api.sanity.io/${API_VERSION}/data/mutate/${DATASET}`,
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mutations: [{ createIfNotExists: doc }] }),
  },
)
if (!createRes.ok) throw new Error(`Mutate failed: ${await createRes.text()}`)
console.log('Seeded opusOsn:', await createRes.json())

// same figures as the selected works osn entry.
const figures = [
  { file: '1.webp', key: 'fig-001', alt: 'Osn project preview' },
  { file: '2.webp', key: 'fig-002', alt: 'Osn project preview two' },
]

const images = []
for (const fig of figures) {
  const image = await uploadImage(path.join(osnDir, fig.file), `osn-${fig.file}`)
  console.log(`Uploaded osn/${fig.file}`)
  images.push({ _type: 'object', _key: fig.key, image, alt: fig.alt })
}

const mutateRes = await fetch(
  `https://${PROJECT_ID}.api.sanity.io/${API_VERSION}/data/mutate/${DATASET}`,
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mutations: [{ patch: { id: DOC_ID, set: { images } } }] }),
  },
)
if (!mutateRes.ok) throw new Error(`Mutate failed: ${await mutateRes.text()}`)
console.log('Attached figures to opusOsn:', await mutateRes.json())
console.log('Verify: *[_type=="opusOsn"][0]{description, "images": images[]{alt}}')
