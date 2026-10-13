// Adds the new Kabi main + widget previews to the top of the detail
// gallery as full-width cells. Reuses the uploaded preview assets (no
// re-upload). Rerunnable: skips when already on top.
// Run:  node --env-file=.env.local scripts/patch-works-kabi-gallery-previews.mjs  (from apps/studio)

const PROJECT_ID = 'dn2lfgdt'
const DATASET = 'production'
const API_VERSION = 'v2022-03-07'
const DOC_ID = 'opusWork-kabi'

const TOKEN = process.env.SANITY_TOKEN?.trim()
if (!TOKEN) {
  console.error('Missing SANITY_TOKEN. Add it to .env.local and retry.')
  process.exit(1)
}

async function sanityQuery(query) {
  const res = await fetch(
    `https://${PROJECT_ID}.api.sanity.io/${API_VERSION}/data/query/${DATASET}?query=${encodeURIComponent(query)}`,
    {headers: {Authorization: `Bearer ${TOKEN}`}},
  )
  if (!res.ok) throw new Error(`Query failed: ${await res.text()}`)
  return (await res.json()).result
}

const kabi = await sanityQuery(
  `*[_type == "opusWork" && _id == "${DOC_ID}"][0]{_id, title, cells, gallery}`,
)
if (!kabi) {
  console.error('No opusWork kabi found.')
  process.exit(1)
}

const galleryAlts = (kabi.gallery ?? []).map((entry) => entry.alt)
if (galleryAlts[0] === 'Kabi main preview' && galleryAlts[1] === 'Kabi widget preview') {
  console.log('New previews already on top of the gallery — nothing to do.')
  process.exit(0)
}

const byAlt = new Map((kabi.cells ?? []).map((entry) => [entry.alt, entry]))
const main = byAlt.get('Kabi main preview')
const widget = byAlt.get('Kabi widget preview')
if (!main || !widget) {
  console.error('Preview cells missing:', [...byAlt.keys()])
  process.exit(1)
}

function galleryCell(cell, key) {
  return {...cell, _key: key, wide: true}
}

const gallery = (kabi.gallery ?? []).filter(
  (entry) => entry.alt !== 'Kabi main preview' && entry.alt !== 'Kabi widget preview',
)
gallery.unshift(galleryCell(main, 'gallery-main'), galleryCell(widget, 'gallery-widget'))

const mutateRes = await fetch(
  `https://${PROJECT_ID}.api.sanity.io/${API_VERSION}/data/mutate/${DATASET}`,
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({mutations: [{patch: {id: DOC_ID, set: {gallery}}}]}),
  },
)
if (!mutateRes.ok) throw new Error(`Mutate failed: ${await mutateRes.text()}`)
console.log('Patched kabi gallery:', await mutateRes.json())
console.log('gallery:', gallery.map((c) => `${c.alt} (wide=${c.wide})`).join(' | '))
