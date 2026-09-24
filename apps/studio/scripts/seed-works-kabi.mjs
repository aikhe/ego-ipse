// Seeds "Kabi" into Sanity as the first selected `opusWork` doc.
// Run:  node --env-file=.env.local scripts/seed-works-kabi.mjs  (from apps/studio)
// Rerunnable: uses createIfNotExists for kabi; existing selected works shift
// down by one only when kabi is newly created. selected=true, order=1.
// Preview cells = greatest-gym-bro + heat, detail gallery adds kabi-model-init.

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

const DESCRIPTION =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'

// same bryl lim quote as the tarsi redesign work (avatar asset reused, no re-upload).
const QUOTE = {
  _type: 'object',
  text: 'Saw your tarsi redesigns and I have to say I like it a lot!!',
  by: 'Bryl Lim, Tarsi Founder',
  href: 'https://bryllim.com/',
  avatar: {
    _type: 'image',
    asset: {
      _type: 'reference',
      _ref: 'image-6f25fc8288dceafffa3acdb834da470033ef88f0-256x256-webp',
    },
  },
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

function cell(image, key, alt, width, height) {
  return {
    _type: 'object',
    _key: key,
    image,
    alt,
    wide: false,
    ratio: `${width} / ${height}`,
    width,
    height,
  }
}

async function sanityQuery(query) {
  const res = await fetch(
    `https://${PROJECT_ID}.api.sanity.io/${API_VERSION}/data/query/${DATASET}?query=${encodeURIComponent(query)}`,
    {headers: {Authorization: `Bearer ${TOKEN}`}},
  )
  if (!res.ok) throw new Error(`Query failed: ${await res.text()}`)
  const data = await res.json()
  return data.result
}

// skip the order shift on reruns so existing works never drift twice.
const existing = await sanityQuery(`*[_type == "opusWork" && _id == "${DOC_ID}"][0]{_id, order}`)
if (existing) {
  console.log(`Kabi already seeded (${existing._id}, order=${existing.order}) — nothing to do.`)
  console.log('Verify: *[_type=="opusWork" && slug.current=="kabi"]')
  process.exit(0)
}

const gymBro = await uploadImage(path.join(kabiDir, 'greatest-gym-bro.webp'), 'kabi-greatest-gym-bro.webp')
console.log('Uploaded kabi/greatest-gym-bro.webp (3000x3000)')
const heat = await uploadImage(path.join(kabiDir, 'heat.webp'), 'kabi-heat.webp')
console.log('Uploaded kabi/heat.webp (3000x3000)')
const modelInit = await uploadImage(path.join(kabiDir, 'kabi-model-init.webp'), 'kabi-model-init.webp')
console.log('Uploaded kabi/kabi-model-init.webp (6596x4660)')

// preview grid is 2 columns with preview=4: two square cells sit side by side.
const cells = [
  cell(gymBro, 'preview-gym-bro', 'Kabi greatest gym bro preview', 3000, 3000),
  cell(heat, 'preview-heat', 'Kabi heat preview', 3000, 3000),
]

const gallery = [
  ...cells.map((c, i) => ({...c, _key: `gallery-${i + 1}`})),
  cell(modelInit, 'gallery-model-init', 'Kabi mascot model sheet', 6596, 4660),
]

const doc = {
  _id: DOC_ID,
  _type: 'opusWork',
  title: 'Kabi',
  slug: {_type: 'slug', current: 'kabi'},
  description: DESCRIPTION,
  selected: true,
  order: 1,
  preview: 4,
  cells,
  gallery,
  quote: QUOTE,
  meta: {
    _type: 'object',
    role: 'Design & Development',
    platform: 'Web App',
    year: '2026',
    stack: 'SvelteKit, Sanity',
    status: 'In progress',
  },
}

const mutations = [{createIfNotExists: doc}]

// make room at the top: bump every other selected work down by one.
const selected = await sanityQuery(`*[_type == "opusWork" && selected == true]{_id, title, order}`)
for (const item of selected) {
  if (item._id === DOC_ID) continue
  if (typeof item.order !== 'number') continue
  mutations.push({patch: {id: item._id, set: {order: item.order + 1}}})
  console.log(`shift ${item.title}: order ${item.order} -> ${item.order + 1}`)
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
console.log('Seeded opusWork kabi:', await mutateRes.json())
console.log('Verify: *[_type=="opusWork" && slug.current=="kabi"]')
