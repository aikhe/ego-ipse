// Seeds the Nvim miscs list into Sanity on the `opusNvim` singleton.
// Run:  bun --env-file=.env.local scripts/seed-opus-nvim-miscs.mjs  (from apps/studio)
// Rerunnable: uses patch set on _id `opusNvim-singleton`.

import {mutate} from './_client.mjs'

const DOC_ID = 'opusNvim-singleton'

const miscs = [
  {
    _key: 'wezterm-sessionizer',
    _type: 'nvimMisc',
    title: 'wezterm-sessionizer',
    description: 'Fuzzy session manager for WezTerm, in the tmux-sessionizer spirit.',
    repo: 'https://github.com/aikhe/wezterm-sessionizer',
  },
]

const mutateRes = await mutate([{patch: {id: DOC_ID, set: {miscs}}}])
console.log('Seeded opusNvim miscs:', mutateRes)
console.log('Verify: *[_type=="opusNvim"][0]{description, miscs}')
