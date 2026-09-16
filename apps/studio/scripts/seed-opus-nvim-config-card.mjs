// Seeds the Nvim "My Config" card into Sanity on the `opusNvim` singleton.
// Run:  $env:SANITY_TOKEN="<editor-token>"; node scripts/seed-opus-nvim-config-card.mjs
// Token: Sanity Manage -> API -> Tokens (Editor write access, production dataset).
// Rerunnable: uses patch set on _id `opusNvim-singleton`.

const PROJECT_ID = 'dn2lfgdt'
const DATASET = 'production'
const API_VERSION = 'v2022-03-07'
const DOC_ID = 'opusNvim-singleton'

const TOKEN = process.env.SANITY_TOKEN?.trim()
if (!TOKEN) {
  console.error('Missing SANITY_TOKEN. Create an Editor token and retry.')
  process.exit(1)
}

const configCard = {
  title: 'My Config',
  description:
    'My full Neovim configuration with plugins, keymaps, and options, versioned on GitHub.',
}

const mutateRes = await fetch(
  `https://${PROJECT_ID}.api.sanity.io/${API_VERSION}/data/mutate/${DATASET}`,
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      mutations: [{patch: {id: DOC_ID, set: {configCard}}}],
    }),
  },
)
if (!mutateRes.ok) throw new Error(`Mutate failed: ${await mutateRes.text()}`)
console.log('Seeded opusNvim configCard:', await mutateRes.json())
console.log('Verify: *[_type=="opusNvim"][0]{description, configCard}')
