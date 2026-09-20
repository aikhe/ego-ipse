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
  {
    _key: 'oh-my-posh',
    _type: 'fleurExtra',
    title: 'Oh My Posh',
    description: 'Custom prompt engine for any shell with theming support.',
    repo: 'https://github.com/aikhe/fleur.nvim/tree/master/extras/oh-my-posh',
  },
  {
    _key: 'oh-my-zsh',
    _type: 'fleurExtra',
    title: 'Oh My Zsh',
    description: 'Community-driven framework for managing Zsh configuration.',
    repo: 'https://github.com/aikhe/fleur.nvim/tree/master/extras/oh-my-zsh',
  },
  {
    _key: 'opencode',
    _type: 'fleurExtra',
    title: 'Opencode',
    description: 'AI-powered terminal coding agent for the command line.',
    repo: 'https://github.com/aikhe/fleur.nvim/tree/master/extras/opencode',
  },
  {
    _key: 'termux',
    _type: 'fleurExtra',
    title: 'Termux',
    description: 'Android terminal emulator and Linux environment app.',
    repo: 'https://github.com/aikhe/fleur.nvim/tree/master/extras/termux',
  },
  {
    _key: 'tmux',
    _type: 'fleurExtra',
    title: 'Tmux',
    description: 'Terminal multiplexer for managing multiple sessions and panes.',
    repo: 'https://github.com/aikhe/fleur.nvim/tree/master/extras/tmux',
  },
  {
    _key: 'wezterm',
    _type: 'fleurExtra',
    title: 'WezTerm',
    description: 'GPU-accelerated cross-platform terminal emulator.',
    repo: 'https://github.com/aikhe/fleur.nvim/tree/master/extras/wezterm',
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
