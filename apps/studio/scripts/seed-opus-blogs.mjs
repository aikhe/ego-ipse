// Seeds the Blogs page copy into Sanity as an `opusBlogs` doc.
// Run:  node --env-file=.env.local scripts/seed-opus-blogs.mjs  (from apps/studio)
// Token: Sanity Manage -> API -> Tokens (Editor write access, production dataset).
// Rerunnable: uses createIfNotExists on _id `opusBlogs-singleton`.

const PROJECT_ID = 'dn2lfgdt'
const DATASET = 'production'
const API_VERSION = 'v2022-03-07'
const DOC_ID = 'opusBlogs-singleton'

const TOKEN = process.env.SANITY_TOKEN?.trim()
if (!TOKEN) {
  console.error('Missing SANITY_TOKEN. Add it to .env.local and retry.')
  process.exit(1)
}

// draft copy: edit freely in the studio under Opus Blogs.
const DESCRIPTION =
  'Notes on **design**, **development**, and the creative process. Essays and field notes from my work, written plainly.'

const doc = {
  _id: DOC_ID,
  _type: 'opusBlogs',
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
console.log('Seeded opusBlogs:', await mutateRes.json())
console.log('Verify: *[_type=="opusBlogs"][0]{description}')
