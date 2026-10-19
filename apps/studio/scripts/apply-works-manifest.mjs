// Applies apps/studio/works-manifest.md to Sanity: per-list order, `selected`
// membership, `preview` variant, and `remove` deletions. Drafts stay in sync
// when present. Dry-run by default, --apply to write.
//
// Manifest line format (slug is the only strict part):
//   - Title — `slug` — preview 4
//   - Title — `slug` — preview 4 — remove
//
// Run: node --env-file=.env.local scripts/apply-works-manifest.mjs
//      node --env-file=.env.local scripts/apply-works-manifest.mjs --apply

import {readFile} from 'node:fs/promises'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const PROJECT_ID = 'dn2lfgdt'
const DATASET = 'production'
const API_VERSION = 'v2022-03-07'
const APPLY = process.argv.includes('--apply')

const TOKEN = process.env.SANITY_TOKEN?.trim()
if (!TOKEN) {
  console.error('Missing SANITY_TOKEN. Add it to .env.local and retry.')
  process.exitCode = 1
} else {
  await main()
}

async function main() {
  const here = path.dirname(fileURLToPath(import.meta.url))
  const manifestPath = path.resolve(here, '..', 'works-manifest.md')

  const SECTIONS = new Map([
    ['Selected Works', 'selected'],
    ['Works', 'works'],
    ['Remove', 'remove'],
  ])

  // --- parse the manifest ---

  const text = await readFile(manifestPath, 'utf8')
  const rows = [] // {slug, preview, remove, list}
  let currentList = null

  for (const rawLine of text.split(/\r?\n/)) {
    const heading = rawLine.match(/^##\s+(.+?)\s*$/)
    if (heading) {
      const name = heading[1]
      currentList = SECTIONS.get(name) ?? null
      if (currentList === null && name !== 'How to edit') {
        console.warn(`unknown section "## ${name}" — ignored`)
      }
      continue
    }
    if (currentList === null) continue
    const bullet = rawLine.match(/^\s*(?:[-*+]|\d+[.)])\s+(.*)$/)
    if (!bullet) continue
    const content = bullet[1].trim()
    const slugMatch = content.match(/`([^`]+)`/)
    const slug = slugMatch?.[1]?.trim()
    if (!slug) {
      console.warn(`line without a backticked slug skipped: "${content.slice(0, 60)}"`)
      continue
    }
    // only look after the slug: titles may contain stray words like "preview"
    const after = content.slice((slugMatch.index ?? 0) + slugMatch[0].length)

    let preview = null
    const previewMatch = after.match(/preview\s*:?\s*(\d+)/i)
    if (previewMatch) {
      const value = Number(previewMatch[1])
      if (value >= 1 && value <= 4) {
        preview = value
      } else {
        console.warn(`slug "${slug}": preview "${previewMatch[1]}" is not 1-4 — left untouched`)
      }
    }

    rows.push({
      slug,
      preview,
      remove: currentList === 'remove' || /\bremove\b/i.test(after),
      list: currentList,
    })
  }

  // Group by slug: `remove` anywhere wins, exact duplicates in a list are an error.
  const manifestBySlug = new Map()
  for (const row of rows) {
    const entry = manifestBySlug.get(row.slug) ?? {slug: row.slug, rows: [], remove: false}
    entry.rows.push(row)
    entry.remove = entry.remove || row.remove
    manifestBySlug.set(row.slug, entry)
  }
  const duplicates = [...manifestBySlug.values()].filter(
    (entry) => !entry.remove && entry.rows.length > 1,
  )
  if (duplicates.length > 0) {
    for (const {slug} of duplicates) {
      console.error(`slug "${slug}" appears more than once — delete one of the lines and retry`)
    }
    process.exitCode = 1
    return
  }
  for (const entry of manifestBySlug.values()) {
    if (entry.remove && entry.rows.length > 1) {
      console.warn(`slug "${entry.slug}" is listed more than once — removal wins`)
    }
  }
  if (rows.length === 0) {
    console.error('No rows found in the manifest. Check the format in works-manifest.md.')
    process.exitCode = 1
    return
  }

  // --- read current state ---

  const query = `*[_type == "opusWork"]{_id, title, "slug": slug.current, selected, order, preview}`
  const res = await fetch(
    `https://${PROJECT_ID}.api.sanity.io/${API_VERSION}/data/query/${DATASET}?perspective=raw&query=${encodeURIComponent(query)}`,
    {headers: {Authorization: `Bearer ${TOKEN}`}},
  )
  if (!res.ok) throw new Error(`Fetch failed: ${await res.text()}`)
  const {result: rawDocs = []} = await res.json()

  const draftIds = new Set(
    rawDocs.filter((doc) => doc._id.startsWith('drafts.')).map((doc) => doc._id),
  )
  const published = rawDocs.filter((doc) => !doc._id.startsWith('drafts.'))
  const docsBySlug = new Map(published.map((doc) => [doc.slug, doc]))
  const byOrder = (a, b) => (a.order ?? 0) - (b.order ?? 0)

  // --- build the plan ---

  const patches = new Map() // id -> set object (published id, plus draft when present)
  const deletes = new Set() // existing ids (published and/or draft)

  function patch(id, set) {
    if (Object.keys(set).length === 0) return
    patches.set(id, {...(patches.get(id) ?? {}), ...set})
    if (draftIds.has(`drafts.${id}`)) {
      patches.set(`drafts.${id}`, {...(patches.get(`drafts.${id}`) ?? {}), ...set})
    }
  }

  for (const [listKey, label] of [
    ['selected', 'Selected Works'],
    ['works', 'Works'],
  ]) {
    const wanted = listKey === 'selected'
    let position = 1

    for (const row of rows) {
      if (row.list !== listKey || row.remove) continue
      const entry = manifestBySlug.get(row.slug)
      if (entry.remove) continue // listed here but queued for removal
      const doc = docsBySlug.get(row.slug)
      if (!doc) {
        console.warn(`[${label}] no opusWork doc for slug "${row.slug}" — line skipped`)
        continue
      }
      const set = {}
      if (doc.selected !== wanted) set.selected = wanted
      if (doc.order !== position) set.order = position
      if (row.preview !== null && doc.preview !== row.preview) set.preview = row.preview
      patch(doc._id, set)
      position++
    }

    // Works in Sanity but not in the manifest stay put, sunk below the listed rows.
    const unlisted = published
      .filter((doc) => doc.selected === wanted && !manifestBySlug.has(doc.slug))
      .sort(byOrder)
    for (const doc of unlisted) {
      if (doc.order !== position) patch(doc._id, {order: position})
      position++
    }
  }

  for (const entry of manifestBySlug.values()) {
    if (!entry.remove) continue
    const doc = docsBySlug.get(entry.slug)
    if (!doc) {
      console.warn(`remove: no opusWork doc for slug "${entry.slug}" — nothing to delete`)
      continue
    }
    deletes.add(doc._id)
    if (draftIds.has(`drafts.${doc._id}`)) deletes.add(`drafts.${doc._id}`)
  }

  // --- report ---

  const currentById = new Map(published.map((doc) => [doc._id, doc]))
  const describe = (doc, set) =>
    Object.entries(set)
      .map(([field, value]) => `${field} ${doc[field]} -> ${value}`)
      .join(', ')

  let changeCount = 0
  for (const [id, set] of patches) {
    if (id.startsWith('drafts.')) continue // logged with its published doc
    const doc = currentById.get(id)
    if (!doc) continue
    console.log(`patch  ${doc.slug}: ${describe(doc, set)}`)
    changeCount++
  }
  for (const id of deletes) {
    const doc = currentById.get(id.replace(/^drafts\./, ''))
    const kind = id.startsWith('drafts.') ? '(draft)' : '(published)'
    console.log(`delete ${doc?.slug ?? id} ${kind}`)
    changeCount++
  }

  console.log(`\n${patches.size} patch(es), ${deletes.size} deletion(s).`)
  if (changeCount === 0) {
    console.log('Manifest already matches Sanity.')
    return
  }
  if (!APPLY) {
    console.log('Dry run — rerun with --apply to write.')
    return
  }

  const mutations = [
    ...[...deletes].map((id) => ({delete: {id}})),
    ...[...patches].map(([id, set]) => ({patch: {id, set}})),
  ]
  const mutateRes = await fetch(
    `https://${PROJECT_ID}.api.sanity.io/${API_VERSION}/data/mutate/${DATASET}`,
    {
      method: 'POST',
      headers: {Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json'},
      body: JSON.stringify({mutations}),
    },
  )
  if (!mutateRes.ok) throw new Error(`Mutate failed: ${await mutateRes.text()}`)
  console.log('Applied:', await mutateRes.json())
}
