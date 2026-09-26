// Moves Kabi Redesign from Selected to regular Works, slotted right under
// Mylo. Closes the gap in Selected orders and opens room in Works orders.
// Run:  node --env-file=.env.local scripts/move-works-kabi-to-works.mjs  (from apps/studio)

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
  `*[_type == "opusWork" && _id == "${DOC_ID}"][0]{_id, title, selected, order}`,
)
if (!kabi) {
  console.error('No opusWork kabi found.')
  process.exit(1)
}
if (kabi.selected !== true) {
  console.log(`Kabi is already a regular work (order=${kabi.order}) — nothing to do.`)
  process.exit(0)
}

const mylo = await sanityQuery(
  `*[_type == "opusWork" && slug.current == "mylo"][0]{_id, title, selected, order}`,
)
if (!mylo || mylo.selected === true || typeof mylo.order !== 'number') {
  console.error('Mylo is not a regular work — aborting.')
  process.exit(1)
}
const target = mylo.order + 1

const mutations = [{patch: {id: DOC_ID, set: {selected: false, order: target}}}]
console.log(`move Kabi Redesign: selected order ${kabi.order} -> works order ${target}`)

// close the gap left in selected works.
const selected = await sanityQuery(
  `*[_type == "opusWork" && selected == true]{_id, title, order}`,
)
for (const item of selected) {
  if (item._id === DOC_ID || typeof item.order !== 'number' || item.order <= kabi.order) continue
  mutations.push({patch: {id: item._id, set: {order: item.order - 1}}})
  console.log(`shift ${item.title}: selected order ${item.order} -> ${item.order - 1}`)
}

// open room under mylo in regular works.
const regular = await sanityQuery(
  `*[_type == "opusWork" && selected != true]{_id, title, order}`,
)
for (const item of regular) {
  if (item._id === DOC_ID || typeof item.order !== 'number' || item.order < target) continue
  mutations.push({patch: {id: item._id, set: {order: item.order + 1}}})
  console.log(`shift ${item.title}: works order ${item.order} -> ${item.order + 1}`)
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
console.log('Moved kabi to works:', await mutateRes.json())
