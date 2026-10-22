// Seeds the Fleur page copy into Sanity as an `opusFleur` doc.
// Run:  bun --env-file=.env.local scripts/seed-opus-fleur.mjs  (from apps/studio)
// Rerunnable: uses createIfNotExists on _id `opusFleur-singleton`.

import {mutate} from './_client.mjs'

const DOC_ID = 'opusFleur-singleton'

const DESCRIPTION =
  'Fleur is my **low-contrast colorscheme for Neovim**, inspired by the **soft tones of a garden at dusk**. Tuned for **perceptual balance**, shipped as a **Lua-configured plugin** with **ready-to-use theme files**. Built **dark-mode-first**, still a **work in progress**.'

const doc = {
  _id: DOC_ID,
  _type: 'opusFleur',
  description: DESCRIPTION,
}

const mutateRes = await mutate([{createIfNotExists: doc}])
console.log('Seeded opusFleur:', mutateRes)
console.log('Verify: *[_type=="opusFleur"][0]{description}')
