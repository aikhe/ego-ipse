// Seeds the Nvim plugins list into Sanity on the `opusNvim` singleton.
// Run:  bun --env-file=.env.local scripts/seed-opus-nvim-plugins.mjs  (from apps/studio)
// Rerunnable: uses patch set on _id `opusNvim-singleton`.

import {mutate} from './_client.mjs'

const DOC_ID = 'opusNvim-singleton'

const plugins = [
  {
    _key: 'wrapped-nvim',
    _type: 'nvimPlugin',
    title: 'wrapped.nvim',
    description: 'View your Neovim configuration insights, history, and heatmaps.',
    repo: 'https://github.com/aikhe/wrapped.nvim',
  },
  {
    _key: 'fleur-nvim',
    _type: 'nvimPlugin',
    title: 'fleur.nvim',
    description:
      'A sophisticated, low-contrast colorscheme for Neovim inspired by the soft tones of a garden at dusk.',
    repo: 'https://github.com/aikhe/fleur.nvim',
  },
  {
    _key: 'cake-nvim',
    _type: 'nvimPlugin',
    title: 'cake.nvim',
    description: 'Plugin for managing and running shell commands in Neovim.',
    repo: 'https://github.com/aikhe/cake.nvim',
  },
]

const mutateRes = await mutate([{patch: {id: DOC_ID, set: {plugins}}}])
console.log('Seeded opusNvim plugins:', mutateRes)
console.log('Verify: *[_type=="opusNvim"][0]{description, plugins}')
