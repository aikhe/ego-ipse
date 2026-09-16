// Uploads local fleur webp figures to Sanity and attaches them to `opusFleur`.
// Run:  $env:SANITY_TOKEN="<editor-token>"; node scripts/seed-opus-fleur-images.mjs
// Token: Sanity Manage -> API -> Tokens (Editor write access, production dataset).
// Sources: ../../web/src/lib/assets/fleur/1.webp, 2.webp (converted from PNG via sharp-cli).
// Rerunnable: re-uploads assets then `set`s images on `opusFleur-singleton`.

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const PROJECT_ID = 'dn2lfgdt'
const DATASET = 'production'
const API_VERSION = 'v2022-03-07'
const DOC_ID = 'opusFleur-singleton'

const TOKEN = process.env.SANITY_TOKEN?.trim()
if (!TOKEN) {
  console.error('Missing SANITY_TOKEN. Create an Editor token and retry.')
  process.exit(1)
}

const here = path.dirname(fileURLToPath(import.meta.url))
const fleurDir = path.resolve(here, '..', '..', 'web', 'src', 'lib', 'assets', 'fleur')

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

// 1.png: 3840x2160, 2.png: 3840x1126 (webp ~50% smaller).
const figures = [
  { file: '1.webp', key: 'fig-001', alt: 'Fleur colorscheme preview one' },
  { file: '2.webp', key: 'fig-002', alt: 'Fleur colorscheme preview two' },
]

const images = []
for (const fig of figures) {
  const image = await uploadImage(path.join(fleurDir, fig.file), `fleur-${fig.file}`)
  console.log(`Uploaded fleur/${fig.file}`)
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
console.log('Attached figures to opusFleur:', await mutateRes.json())
console.log('Verify: *[_type=="opusFleur"][0]{description, "images": images[]{alt}}')
