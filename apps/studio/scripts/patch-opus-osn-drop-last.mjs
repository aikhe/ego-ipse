// Removes the last Osn figure ("Osn overview stats and recent activity")
// from the `opusOsn` singleton gallery. Keeps Fig 01-03 untouched.
// Run:  node --env-file=.env.local scripts/patch-opus-osn-drop-last.mjs  (from apps/studio)

const PROJECT_ID = 'dn2lfgdt'
const DATASET = 'production'
const API_VERSION = 'v2022-03-07'
const DOC_ID = 'opusOsn-singleton'
const DROP_ALT = 'Osn overview stats and recent activity'

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

const doc = await sanityQuery(
  `*[_type == "opusOsn" && _id == "${DOC_ID}"][0]{_id, images}`,
)
if (!doc) {
  console.error('No opusOsn singleton found.')
  process.exit(1)
}

const images = doc.images ?? []
const last = images[images.length - 1]
if (!last || last.alt !== DROP_ALT) {
  console.log(`Last figure is "${last?.alt ?? 'none'}" — nothing to do.`)
  process.exit(0)
}

const kept = images.slice(0, -1)
const mutateRes = await fetch(
  `https://${PROJECT_ID}.api.sanity.io/${API_VERSION}/data/mutate/${DATASET}`,
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({mutations: [{patch: {id: DOC_ID, set: {images: kept}}}]}),
  },
)
if (!mutateRes.ok) throw new Error(`Mutate failed: ${await mutateRes.text()}`)
console.log('Dropped last opusOsn figure:', await mutateRes.json())
console.log('images:', kept.map((entry) => entry.alt).join(' | '))
