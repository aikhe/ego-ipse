// Swaps Kabi preview cells to main + widget-preview (2 full-width rows),
// swaps the gallery gym-bro image to the non-text version, and moves Kabi
// back to Selected Works at order 1 (shifts other selected down, closes
// the gap in regular works).
// Run:  node --env-file=.env.local scripts/patch-works-kabi-previews-top.mjs  (from apps/studio)

import {readFile} from 'node:fs/promises'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const PROJECT_ID = 'dn2lfgdt'
const DATASET = 'production'
const API_VERSION = 'v2022-03-07'
const DOC_ID = 'opusWork-kabi'

const TOKEN = process.env.SANITY_TOKEN?.trim()
if (!TOKEN) {
  console.error('Missing SANITY_TOKEN. Add it to .env.local and retry.')
  process.exit(1)
}

const here = path.dirname(fileURLToPath(import.meta.url))
const kabiDir = path.resolve(here, '..', '..', 'web', 'src', 'lib', 'assets', 'works', 'kabi')

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

function cell(image, key, alt, width, height, wide) {
  return {
    _type: 'object',
    _key: key,
    image,
    alt,
    wide,
    ratio: `${width} / ${height}`,
    width,
    height,
  }
}

const kabi = await sanityQuery(
  `*[_type == "opusWork" && _id == "${DOC_ID}"][0]{_id, title, selected, order, cells{alt}, gallery}`,
)
if (!kabi) {
  console.error('No opusWork kabi found.')
  process.exit(1)
}

const previewAlts = (kabi.cells ?? []).map((c) => c.alt)
if (kabi.selected === true && kabi.order === 1 && previewAlts[0] === 'Kabi main preview') {
  console.log('Kabi already selected at top with new previews — nothing to do.')
  process.exit(0)
}
const kabiOldOrder = typeof kabi.order === 'number' ? kabi.order : null

const main = await uploadImage(path.join(kabiDir, 'main.webp'), 'kabi-main.webp')
console.log('Uploaded kabi/main.webp (3840x2160)')
const widget = await uploadImage(
  path.join(kabiDir, 'widget-preview.webp'),
  'kabi-widget-preview.webp',
)
console.log('Uploaded kabi/widget-preview.webp (3840x2912)')
const gymBro = await uploadImage(
  path.join(kabiDir, 'greatest-gym-bro.webp'),
  'kabi-greatest-gym-bro-nontext.webp',
)
console.log('Uploaded kabi/greatest-gym-bro.webp non-text (3000x3000)')

// 2 rows, 1 img per row full width (preview=4 + wide=true).
const cells = [
  cell(main, 'preview-main', 'Kabi main preview', 3840, 2160, true),
  cell(widget, 'preview-widget', 'Kabi widget preview', 3840, 2912, true),
]

const gallery = (kabi.gallery ?? []).map((entry) =>
  entry.alt === 'Kabi greatest gym bro preview'
    ? {...entry, image: gymBro, width: 3000, height: 3000, ratio: '3000 / 3000'}
    : entry,
)

const mutations = [{patch: {id: DOC_ID, set: {selected: true, order: 1, cells, gallery}}}]
console.log(
  `move ${kabi.title}: selected=${kabi.selected} order=${kabi.order} -> selected=true order=1`,
)

// make room at the top: bump every other selected work down by one.
const selected = await sanityQuery(`*[_type == "opusWork" && selected == true]{_id, title, order}`)
for (const item of selected) {
  if (item._id === DOC_ID) continue
  if (typeof item.order !== 'number') continue
  mutations.push({patch: {id: item._id, set: {order: item.order + 1}}})
  console.log(`shift ${item.title}: selected order ${item.order} -> ${item.order + 1}`)
}

// close the gap left in regular works.
if (kabi.selected !== true && kabiOldOrder !== null) {
  const regular = await sanityQuery(`*[_type == "opusWork" && selected != true]{_id, title, order}`)
  for (const item of regular) {
    if (item._id === DOC_ID || typeof item.order !== 'number' || item.order <= kabiOldOrder)
      continue
    mutations.push({patch: {id: item._id, set: {order: item.order - 1}}})
    console.log(`shift ${item.title}: works order ${item.order} -> ${item.order - 1}`)
  }
}

const mutateRes = await fetch(
  `https://${PROJECT_ID}.api.sanity.io/${API_VERSION}/data/mutate/${DATASET}`,
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({mutations}),
  },
)
if (!mutateRes.ok) throw new Error(`Mutate failed: ${await mutateRes.text()}`)
console.log('Patched opusWork kabi:', await mutateRes.json())
console.log('Verify: *[_type=="opusWork" && slug.current=="kabi"]')
