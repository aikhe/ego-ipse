// Seeds the Nvim page copy into Sanity as an `opusNvim` doc.
// Run:  bun --env-file=.env.local scripts/seed-opus-nvim.mjs  (from apps/studio)
// Rerunnable: uses createIfNotExists on _id `opusNvim-singleton`.

import {mutate} from './_client.mjs'

const DOC_ID = 'opusNvim-singleton'

const DESCRIPTION =
  'My daily driver is a **hand-rolled Neovim setup**, tuned for **speed and minimal friction** — **Lua-configured**, lazy-loaded, and stripped to the essentials.'

const CONFIG_CARD = {
  title: 'My Config',
  description:
    'My full Neovim configuration with plugins, keymaps, and options, versioned on GitHub.',
}

const doc = {
  _id: DOC_ID,
  _type: 'opusNvim',
  description: DESCRIPTION,
  configCard: CONFIG_CARD,
}

const mutateRes = await mutate([{createIfNotExists: doc}])
console.log('Seeded opusNvim:', mutateRes)
console.log('Verify: *[_type=="opusNvim"][0]{description, configCard}')
