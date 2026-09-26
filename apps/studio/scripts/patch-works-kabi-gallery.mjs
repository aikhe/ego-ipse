// Moves the Kabi model sheet to the top of the detail gallery as a
// full-width cell. Preview cells (card grid) are left untouched.
// Run:  node --env-file=.env.local scripts/patch-works-kabi-gallery.mjs  (from apps/studio)

const PROJECT_ID = 'dn2lfgdt'
const DATASET = 'production'
const API_VERSION = 'v2022-03-07'

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
  `*[_type == "opusWork" && slug.current == "kabi"][0]{_id, gallery}`,
)
if (!doc) {
  console.error('No opusWork with slug "kabi" found.')
  process.exit(1)
}

const byAlt = new Map((doc.gallery ?? []).map((entry) => [entry.alt, entry]))
const model = byAlt.get('Kabi mascot model sheet')
const heat = byAlt.get('Kabi heat preview')
const gymBro = byAlt.get('Kabi greatest gym bro preview')
if (!model || !heat || !gymBro) {
  console.error('Unexpected gallery contents:', [...byAlt.keys()])
  process.exit(1)
}

const gallery = [
  {...model, wide: true},
  {...heat, wide: false},
  {...gymBro, wide: false},
]

const mutateRes = await fetch(
  `https://${PROJECT_ID}.api.sanity.io/${API_VERSION}/data/mutate/${DATASET}`,
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({mutations: [{patch: {id: doc._id, set: {gallery}}}]}),
  },
)
if (!mutateRes.ok) throw new Error(`Mutate failed: ${await mutateRes.text()}`)
console.log('Patched kabi gallery:', await mutateRes.json())
console.log('gallery:', gallery.map((c) => `${c.alt} (wide=${c.wide})`).join(' | '))
