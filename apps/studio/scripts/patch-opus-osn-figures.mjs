// Appends the two new Osn dashboard figures to the `opusOsn` singleton.
// Run:  node --env-file=.env.local scripts/patch-opus-osn-figures.mjs  (from apps/studio)
// Rerunnable: skips figures whose alt already exists.
// Sources: ../../web/src/lib/assets/works/osn/osn-progress-timeline.webp (3400x1720),
//          ../../web/src/lib/assets/works/osn/osn-overview-recent.webp (1568x2176).

import {readFile} from 'node:fs/promises'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const PROJECT_ID = 'dn2lfgdt'
const DATASET = 'production'
const API_VERSION = 'v2022-03-07'
const DOC_ID = 'opusOsn-singleton'

const TOKEN = process.env.SANITY_TOKEN?.trim()
if (!TOKEN) {
  console.error('Missing SANITY_TOKEN. Add it to .env.local and retry.')
  process.exit(1)
}

const here = path.dirname(fileURLToPath(import.meta.url))
const osnDir = path.resolve(here, '..', '..', 'web', 'src', 'lib', 'assets', 'works', 'osn')

async function sanityQuery(query) {
  const res = await fetch(
    `https://${PROJECT_ID}.api.sanity.io/${API_VERSION}/data/query/${DATASET}?query=${encodeURIComponent(query)}`,
    {headers: {Authorization: `Bearer ${TOKEN}`}},
  )
  if (!res.ok) throw new Error(`Query failed: ${await res.text()}`)
  return (await res.json()).result
}

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

const doc = await sanityQuery(
  `*[_type == "opusOsn" && _id == "${DOC_ID}"][0]{_id, images}`,
)
if (!doc) {
  console.error('No opusOsn singleton found.')
  process.exit(1)
}

const existingAlts = new Set((doc.images ?? []).map((entry) => entry.alt))

const figures = [
  {
    file: 'osn-progress-timeline.webp',
    key: 'fig-003',
    alt: 'Osn progress timeline and activity heatmap',
  },
  {
    file: 'osn-overview-recent.webp',
    key: 'fig-004',
    alt: 'Osn overview stats and recent activity',
  },
]

const images = [...(doc.images ?? [])]
for (const fig of figures) {
  if (existingAlts.has(fig.alt)) {
    console.log(`skip ${fig.file} — already attached`)
    continue
  }
  const image = await uploadImage(path.join(osnDir, fig.file), `osn-${fig.file}`)
  console.log(`Uploaded osn/${fig.file}`)
  images.push({_type: 'object', _key: fig.key, image, alt: fig.alt})
}

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
console.log('Attached figures to opusOsn:', await mutateRes.json())
console.log('images:', images.map((entry) => entry.alt).join(' | '))
