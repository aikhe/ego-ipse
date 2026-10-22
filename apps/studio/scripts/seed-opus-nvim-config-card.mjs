// Seeds the Nvim "My Config" card into Sanity on the `opusNvim` singleton.
// Run:  bun --env-file=.env.local scripts/seed-opus-nvim-config-card.mjs  (from apps/studio)
// Rerunnable: uses patch set on _id `opusNvim-singleton`.

import {mutate} from './_client.mjs'

const DOC_ID = 'opusNvim-singleton'

const configCard = {
  title: 'My Config',
  description:
    'My full Neovim configuration with plugins, keymaps, and options, versioned on GitHub.',
}

const mutateRes = await mutate([{patch: {id: DOC_ID, set: {configCard}}}])
console.log('Seeded opusNvim configCard:', mutateRes)
console.log('Verify: *[_type=="opusNvim"][0]{description, configCard}')
