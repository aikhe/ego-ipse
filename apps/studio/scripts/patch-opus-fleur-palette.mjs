// Swaps the fleur figure for the new palette webp. Replaces the current
// single image in place (same _key). Rerunnable: skips when the palette
// asset is already attached.
// Run:  node --env-file=.env.local scripts/patch-opus-fleur-palette.mjs  (from apps/studio)

import {readFile} from 'node:fs/promises'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const PROJECT_ID = 'dn2lfgdt'
const DATASET = 'production'
const API_VERSION = 'v2022-03-07'
const DOC_ID = 'opusFleur-singleton'

const TOKEN = process.env.SANITY_TOKEN?.trim()
if (!TOKEN) {
  console.error('Missing SANITY_TOKEN. Add it to .env.local and retry.')
  process.exit(1)
}

const here = path.dirname(fileURLToPath(import.meta.url))
const webpPath = path.resolve(here, '..', '..', 'web', 'src', 'lib', 'assets', 'fleur-palette.webp')

async function sanityQuery(query) {
  const res = await fetch(
    `https://${PROJECT_ID}.api.sanity.io/${API_VERSION}/data/query/${DATASET}?query=${encodeURIComponent(query)}`,
    {headers: {Authorization: `Bearer ${TOKEN}`}},
  )
  if (!res.ok) throw new Error(`Query failed: ${await res.text()}`)
  return (await res.json()).result
}

const doc = await sanityQuery(
  `*[_type == "opusFleur" && _id == "${DOC_ID}"][0]{_id, images}`,
)
if (!doc) {
  console.error('No opusFleur singleton found.')
  process.exit(1)
}

if ((doc.images ?? []).some((entry) => entry.alt === 'Fleur colorscheme palette')) {
  console.log('Palette already attached to opusFleur — nothing to do.')
  process.exit(0)
}

const buf = await readFile(webpPath)
const upRes = await fetch(
  `https://${PROJECT_ID}.api.sanity.io/${API_VERSION}/assets/images/${DATASET}?filename=${encodeURIComponent('fleur-palette.webp')}`,
  {
    method: 'POST',
    headers: {Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'image/webp'},
    body: buf,
  },
)
if (!upRes.ok) throw new Error(`Upload failed: ${await upRes.text()}`)
const asset = await upRes.json()
const ref = asset._id ?? asset.document?._id
console.log('Uploaded fleur-palette.webp (3840x1126):', ref)

const image = {_type: 'image', asset: {_type: 'reference', _ref: ref}}
const images = (doc.images ?? []).map((entry) => ({
  ...entry,
  image,
  alt: 'Fleur colorscheme palette',
}))

const mutateRes = await fetch(
  `https://${PROJECT_ID}.api.sanity.io/${API_VERSION}/data/mutate/${DATASET}`,
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({mutations: [{patch: {id: DOC_ID, set: {images}}}]}),
  },
)
if (!mutateRes.ok) throw new Error(`Mutate failed: ${await mutateRes.text()}`)
console.log('Patched opusFleur:', await mutateRes.json())
console.log('Verify: *[_type=="opusFleur"][0]{description, "images": images[]{alt}}')
