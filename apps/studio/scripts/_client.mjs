// shared sanity http helpers for the seed scripts (production dataset).
// token comes from SANITY_TOKEN: bun --env-file=.env.local scripts/<name>.mjs

import {readFile} from 'node:fs/promises'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const PROJECT_ID = 'dn2lfgdt'
const DATASET = 'production'
const API_VERSION = 'v2022-03-07'

const TOKEN = process.env.SANITY_TOKEN?.trim()
if (!TOKEN) {
  console.error('Missing SANITY_TOKEN. Add it to .env.local and retry.')
  process.exit(1)
}

const BASE_URL = `https://${PROJECT_ID}.api.sanity.io/${API_VERSION}`

// source images for the seed scripts (apps/studio/seed-assets)
export const seedAssets = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'seed-assets',
)

// applies mutations and returns the parsed response
export async function mutate(mutations) {
  const res = await fetch(`${BASE_URL}/data/mutate/${DATASET}`, {
    method: 'POST',
    headers: {Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json'},
    body: JSON.stringify({mutations}),
  })
  if (!res.ok) throw new Error(`Mutate failed: ${await res.text()}`)
  return res.json()
}

// runs a groq query and returns its result; raw includes drafts
export async function query(groq, {raw = false} = {}) {
  const perspective = raw ? 'perspective=raw&' : ''
  const res = await fetch(
    `${BASE_URL}/data/query/${DATASET}?${perspective}query=${encodeURIComponent(groq)}`,
    {
      headers: {Authorization: `Bearer ${TOKEN}`},
    },
  )
  if (!res.ok) throw new Error(`Query failed: ${await res.text()}`)
  return (await res.json()).result
}

// uploads a webp and returns an image reference
export async function uploadImage(absPath, filename) {
  const res = await fetch(
    `${BASE_URL}/assets/images/${DATASET}?filename=${encodeURIComponent(filename)}`,
    {
      method: 'POST',
      headers: {Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'image/webp'},
      body: await readFile(absPath),
    },
  )
  if (!res.ok) throw new Error(`Upload failed for ${filename}: ${await res.text()}`)
  const asset = await res.json()
  return {_type: 'image', asset: {_type: 'reference', _ref: asset._id ?? asset.document?._id}}
}
