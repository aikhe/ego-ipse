// Seeds the Blogs page copy into Sanity as an `opusBlogs` doc.
// Run:  bun --env-file=.env.local scripts/seed-opus-blogs.mjs  (from apps/studio)
// Rerunnable: uses createIfNotExists on _id `opusBlogs-singleton`.

import {mutate} from './_client.mjs'

const DOC_ID = 'opusBlogs-singleton'

// draft copy: edit freely in the studio under Opus Blogs.
const DESCRIPTION =
  'Notes on **design**, **development**, and the creative process. Essays and field notes from my work, written plainly.'

const doc = {
  _id: DOC_ID,
  _type: 'opusBlogs',
  description: DESCRIPTION,
}

const mutateRes = await mutate([{createIfNotExists: doc}])
console.log('Seeded opusBlogs:', mutateRes)
console.log('Verify: *[_type=="opusBlogs"][0]{description}')
