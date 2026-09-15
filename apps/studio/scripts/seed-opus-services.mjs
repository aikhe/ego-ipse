// Seeds the current Services page copy into Sanity as an `opusServices` doc.
// Run:  $env:SANITY_TOKEN="<editor-token>"; node scripts/seed-opus-services.mjs
// Token: Sanity Manage -> API -> Tokens (Editor write access, production dataset).
// Rerunnable: uses createIfNotExists on _id `opusServices-singleton`.

const PROJECT_ID = 'dn2lfgdt'
const DATASET = 'production'
const API_VERSION = 'v2022-03-07'
const DOC_ID = 'opusServices-singleton'

const TOKEN = process.env.SANITY_TOKEN?.trim()
if (!TOKEN) {
  console.error('Missing SANITY_TOKEN. Create an Editor token and retry.')
  process.exit(1)
}

// current copy from apps/web/src/routes/(opus)/services/+page.svelte
const DESCRIPTION =
  'Freelancing since 2025, I help startups and small teams with design, web development, and creative work, from brand and product design to building and shipping sites.'

const doc = {
  _id: DOC_ID,
  _type: 'opusServices',
  description: DESCRIPTION,
}

const mutateRes = await fetch(
  `https://${PROJECT_ID}.api.sanity.io/${API_VERSION}/data/mutate/${DATASET}`,
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({mutations: [{createIfNotExists: doc}]}),
  },
)
if (!mutateRes.ok) throw new Error(`Mutate failed: ${await mutateRes.text()}`)
console.log('Seeded opusServices:', await mutateRes.json())
console.log('Verify: *[_type=="opusServices"][0]{description}')
