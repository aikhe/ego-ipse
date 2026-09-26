// Patches the Kabi `opusWork` doc: title -> "Kabi Redesign", preview cells
// swapped (heat first), meta mirrored from Tarsi Redesign.
// Run:  node --env-file=.env.local scripts/patch-works-kabi.mjs  (from apps/studio)

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
  `*[_type == "opusWork" && slug.current == "kabi"][0]{_id, title, cells, gallery, meta}`,
)
if (!doc) {
  console.error('No opusWork with slug "kabi" found.')
  process.exit(1)
}

const cells = [...(doc.cells ?? [])].reverse()
const gallery = [...(doc.gallery ?? [])]
// first two gallery entries mirror the previews: keep the model sheet last.
if (gallery.length >= 2) {
  const [first, second, ...rest] = gallery
  gallery.splice(0, gallery.length, second, first, ...rest)
}

const mutations = [
  {
    patch: {
      id: doc._id,
      set: {
        title: 'Kabi Redesign',
        cells,
        gallery,
        meta: {
          ...(doc.meta ?? {}),
          _type: 'object',
          role: 'Design',
          platform: 'Mobile App',
          year: '2025',
          stack: 'Figma, Illustrator, Anim8',
          status: 'Concept',
        },
      },
    },
  },
]

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
console.log('cells:', cells.map((c) => c.alt).join(' | '))
console.log('gallery:', gallery.map((c) => c.alt).join(' | '))
