// Migrates `opusWork.meta` from the legacy array shape to the fixed object shape.
// Legacy: meta: [{_key, k: 'Role', v: '...'}, ...]
// New:    meta: {_type: 'object', role, platform, year, stack, status}
//
// Safe + idempotent: docs already on the object shape are skipped, nothing is
// deleted until the patch succeeds. Run dry-run first, then --apply.
//
// Run:  node --env-file=.env.local scripts/migrate-meta-to-object.mjs        (dry run)
//       node --env-file=.env.local scripts/migrate-meta-to-object.mjs --apply (write)

const PROJECT_ID = 'dn2lfgdt'
const DATASET = 'production'
const API_VERSION = 'v2022-03-07'
const APPLY = process.argv.includes('--apply')

const TOKEN = process.env.SANITY_TOKEN?.trim()
if (!TOKEN) {
  console.error('Missing SANITY_TOKEN. Add it to .env.local and retry.')
  process.exit(1)
}

const FIELDS = ['role', 'platform', 'year', 'stack', 'status']

function fromLegacyArray(meta) {
  const byKey = new Map()
  for (const row of meta ?? []) {
    const key = (row?._key ?? row?.k ?? '').trim().toLowerCase()
    const value = (row?.v ?? '').trim()
    if (FIELDS.includes(key) && value && !byKey.has(key)) byKey.set(key, value)
  }
  return byKey
}

const query = encodeURIComponent(`*[_type == "opusWork"]{_id, title, meta}`)
const res = await fetch(
  `https://${PROJECT_ID}.api.sanity.io/${API_VERSION}/data/query/${DATASET}?query=${query}`,
  {headers: {Authorization: `Bearer ${TOKEN}`}},
)
if (!res.ok) throw new Error(`Fetch failed: ${await res.text()}`)
const {result: docs = []} = await res.json()

const mutations = []
for (const doc of docs) {
  if (!Array.isArray(doc.meta)) {
    console.log(`skip ${doc.title ?? doc._id}: already object shape`)
    continue
  }
  const byKey = fromLegacyArray(doc.meta)
  const missing = FIELDS.filter((f) => !byKey.get(f))
  if (missing.length > 0) {
    console.warn(
      `warn ${doc.title ?? doc._id}: missing ${missing.join(', ')} — will patch with empty strings, fill in Studio after`,
    )
  }
  mutations.push({
    patch: {
      id: doc._id,
      set: {
        meta: {
          _type: 'object',
          role: byKey.get('role') ?? '',
          platform: byKey.get('platform') ?? '',
          year: byKey.get('year') ?? '',
          stack: byKey.get('stack') ?? '',
          status: byKey.get('status') ?? '',
        },
      },
    },
  })
  console.log(`ready ${doc.title ?? doc._id}: array -> object`)
}

console.log(`\n${mutations.length} doc(s) to migrate.`)
if (mutations.length === 0) process.exit(0)
if (!APPLY) {
  console.log('Dry run — rerun with --apply to write.')
  process.exit(0)
}

const mutateRes = await fetch(
  `https://${PROJECT_ID}.api.sanity.io/${API_VERSION}/data/mutate/${DATASET}`,
  {
    method: 'POST',
    headers: {Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json'},
    body: JSON.stringify({mutations}),
  },
)
if (!mutateRes.ok) throw new Error(`Mutate failed: ${await mutateRes.text()}`)
console.log('Migrated:', await mutateRes.json())
