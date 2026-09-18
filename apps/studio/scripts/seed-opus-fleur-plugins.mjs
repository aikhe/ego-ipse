// Seeds the Fleur extras list into Sanity on the `opusFleur` singleton.
// Run:  $env:SANITY_TOKEN="<editor-token>"; node scripts/seed-opus-fleur-plugins.mjs
// Token: Sanity Manage -> API -> Tokens (Editor write access, production dataset).
// Rerunnable: uses patch set on _id `opusFleur-singleton`.
// Migrates the old `plugins` field: sets `extras`, unsets `plugins`.

const PROJECT_ID = 'dn2lfgdt'
const DATASET = 'production'
const API_VERSION = 'v2022-03-07'
const DOC_ID = 'opusFleur-singleton'

const TOKEN = process.env.SANITY_TOKEN?.trim()
if (!TOKEN) {
  console.error('Missing SANITY_TOKEN. Create an Editor token and retry.')
  process.exit(1)
}

const extras = [
  {
    _key: 'nvim',
    _type: 'fleurExtra',
    title: 'Nvim',
    description:
      'Hyperextensible modal text editor focused on speed and customization.',
    repo: 'https://github.com/aikhe/fleur.nvim',
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
    body: JSON.stringify({
      mutations: [{patch: {id: DOC_ID, set: {extras}, unset: ['plugins']}}],
    }),
  },
)
if (!mutateRes.ok) throw new Error(`Mutate failed: ${await mutateRes.text()}`)
console.log('Seeded opusFleur extras:', await mutateRes.json())
console.log('Verify: *[_type=="opusFleur"][0]{description, extras}')
