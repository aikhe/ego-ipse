// Reorders Selected Works: Ipse Archive + UccingoXJira move to right after
// Klaro (Ipse Archive first). Dry-run by default, --apply to write.
//
// Run: node --env-file=.env.local scripts/reorder-selected-works.mjs
//      node --env-file=.env.local scripts/reorder-selected-works.mjs --apply

const PROJECT_ID = 'dn2lfgdt';
const DATASET = 'production';
const API_VERSION = 'v2022-03-07';
const APPLY = process.argv.includes('--apply');

const TOKEN = process.env.SANITY_TOKEN?.trim();
if (!TOKEN) {
  console.error('Missing SANITY_TOKEN. Add it to .env.local and retry.');
  process.exit(1);
}

// desired sequence (selected works, in display order)
const SEQUENCE = [
  'Tarsi Redesign',
  'Uccingo',
  'Sola',
  'Klaro',
  'Ipse Archive',
  'UccingoXJira',
  'Gem Smoke',
  'Osn',
  'Habi',
  'Bananasplit',
  'Katha',
];

const query = encodeURIComponent(
  '*[_type == "opusWork" && selected == true]{_id, title, order}',
);
const res = await fetch(
  `https://${PROJECT_ID}.api.sanity.io/${API_VERSION}/data/query/${DATASET}?query=${query}`,
  {headers: {Authorization: `Bearer ${TOKEN}`}},
);
if (!res.ok) throw new Error(`Fetch failed: ${await res.text()}`);
const {result: docs = []} = await res.json();

const byTitle = new Map(docs.map((d) => [d.title, d]));
const mutations = [];
SEQUENCE.forEach((title, i) => {
  const doc = byTitle.get(title);
  const want = i + 1;
  if (!doc) {
    console.warn(`missing doc titled "${title}" — skipping`);
    return;
  }
  if (doc.order === want) {
    console.log(`keep ${title}: order=${want}`);
    return;
  }
  console.log(`move ${title}: order ${doc.order} -> ${want}`);
  mutations.push({patch: {id: doc._id, set: {order: want}}});
});

for (const doc of docs) {
  if (!SEQUENCE.includes(doc.title)) {
    console.warn(`untracked selected doc "${doc.title}" (order=${doc.order}) left untouched`);
  }
}

console.log(`\n${mutations.length} doc(s) to reorder.`);
if (mutations.length === 0) process.exit(0);
if (!APPLY) {
  console.log('Dry run — rerun with --apply to write.');
  process.exit(0);
}

const mutateRes = await fetch(
  `https://${PROJECT_ID}.api.sanity.io/${API_VERSION}/data/mutate/${DATASET}`,
  {
    method: 'POST',
    headers: {Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json'},
    body: JSON.stringify({mutations}),
  },
);
if (!mutateRes.ok) throw new Error(`Mutate failed: ${await mutateRes.text()}`);
console.log('Reordered:', await mutateRes.json());
