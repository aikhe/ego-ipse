// Uploads local fleur webp figures to Sanity and attaches them to `opusFleur`.
// Run:  bun --env-file=.env.local scripts/seed-opus-fleur-images.mjs  (from apps/studio)
// Sources: ../seed-assets/fleur/1.webp, 2.webp (converted from PNG via sharp-cli).
// Rerunnable: re-uploads assets then `set`s images on `opusFleur-singleton`.

import path from 'node:path'
import {mutate, uploadImage, seedAssets} from './_client.mjs'

const DOC_ID = 'opusFleur-singleton'

const fleurDir = path.join(seedAssets, 'fleur')

// 1.png: 3840x2160, 2.png: 3840x1126 (webp ~50% smaller).
const figures = [
  {file: '1.webp', key: 'fig-001', alt: 'Fleur colorscheme preview one'},
  {file: '2.webp', key: 'fig-002', alt: 'Fleur colorscheme preview two'},
]

const images = []
for (const fig of figures) {
  const image = await uploadImage(path.join(fleurDir, fig.file), `fleur-${fig.file}`)
  console.log(`Uploaded fleur/${fig.file}`)
  images.push({_type: 'object', _key: fig.key, image, alt: fig.alt})
}

const mutateRes = await mutate([{patch: {id: DOC_ID, set: {images}}}])
console.log('Attached figures to opusFleur:', mutateRes)
console.log('Verify: *[_type=="opusFleur"][0]{description, "images": images[]{alt}}')
