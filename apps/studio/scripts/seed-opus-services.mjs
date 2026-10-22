// Seeds the current Services page copy into Sanity as an `opusServices` doc.
// Run:  bun --env-file=.env.local scripts/seed-opus-services.mjs  (from apps/studio)
// Rerunnable: uses createIfNotExists on _id `opusServices-singleton`.

import {mutate} from './_client.mjs'

const DOC_ID = 'opusServices-singleton'

// current copy from apps/web/src/routes/(opus)/services/+page.svelte
const DESCRIPTION =
  'Freelancing since 2025, I help startups and small teams with design, web development, and creative work, from brand and product design to building and shipping sites.'

const doc = {
  _id: DOC_ID,
  _type: 'opusServices',
  description: DESCRIPTION,
}

const mutateRes = await mutate([{createIfNotExists: doc}])
console.log('Seeded opusServices:', mutateRes)
console.log('Verify: *[_type=="opusServices"][0]{description}')
