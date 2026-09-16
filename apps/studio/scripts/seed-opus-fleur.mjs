// Seeds the Fleur page copy into Sanity as an `opusFleur` doc.
// Run:  $env:SANITY_TOKEN="<editor-token>"; node scripts/seed-opus-fleur.mjs
// Token: Sanity Manage -> API -> Tokens (Editor write access, production dataset).
// Rerunnable: uses createIfNotExists on _id `opusFleur-singleton`.

const PROJECT_ID = 'dn2lfgdt'
const DATASET = 'production'
const API_VERSION = 'v2022-03-07'
const DOC_ID = 'opusFleur-singleton'

const TOKEN = process.env.SANITY_TOKEN?.trim()
if (!TOKEN) {
  console.error('Missing SANITY_TOKEN. Create an Editor token and retry.')
  process.exit(1)
}

const DESCRIPTION =
  'Fleur is my **low-contrast colorscheme for Neovim**, inspired by the **soft tones of a garden at dusk**. Tuned for **perceptual balance**, shipped as a **Lua-configured plugin** with **ready-to-use theme files**. Built **dark-mode-first**, still a **work in progress**.'

const doc = {
  _id: DOC_ID,
  _type: 'opusFleur',
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
console.log('Seeded opusFleur:', await mutateRes.json())
console.log('Verify: *[_type=="opusFleur"][0]{description}')
