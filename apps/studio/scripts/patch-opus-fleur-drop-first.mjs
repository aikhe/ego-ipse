// Removes the first Fleur figure from the `opusFleur` singleton gallery.
// Run:  node --env-file=.env.local scripts/patch-opus-fleur-drop-first.mjs  (from apps/studio)

const PROJECT_ID = 'dn2lfgdt'
const DATASET = 'production'
const API_VERSION = 'v2022-03-07'
const DOC_ID = 'opusFleur-singleton'

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
  `*[_type == "opusFleur" && _id == "${DOC_ID}"][0]{_id, images}`,
)
if (!doc) {
  console.error('No opusFleur singleton found.')
  process.exit(1)
}

const images = doc.images ?? []
if (images.length === 0) {
  console.log('No fleur figures — nothing to do.')
  process.exit(0)
}

console.log('before:', images.map((entry) => entry.alt).join(' | '))
const kept = images.slice(1)
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
console.log('Dropped first opusFleur figure:', await mutateRes.json())
console.log('after:', kept.map((entry) => entry.alt).join(' | '))
