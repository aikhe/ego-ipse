// Stacks both Kabi preview cells full-width (wide=true). Detail gallery
// is left untouched.
// Run:  node --env-file=.env.local scripts/patch-works-kabi-preview.mjs  (from apps/studio)

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
  `*[_type == "opusWork" && slug.current == "kabi"][0]{_id, cells}`,
)
if (!doc) {
  console.error('No opusWork with slug "kabi" found.')
  process.exit(1)
}

const cells = (doc.cells ?? []).map((entry) => ({...entry, wide: true}))

const mutateRes = await fetch(
  `https://${PROJECT_ID}.api.sanity.io/${API_VERSION}/data/mutate/${DATASET}`,
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({mutations: [{patch: {id: doc._id, set: {cells}}}]}),
  },
)
if (!mutateRes.ok) throw new Error(`Mutate failed: ${await mutateRes.text()}`)
console.log('Patched kabi preview:', await mutateRes.json())
console.log('cells:', cells.map((c) => `${c.alt} (wide=${c.wide})`).join(' | '))
