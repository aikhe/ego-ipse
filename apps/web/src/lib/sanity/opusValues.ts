import type { SanityOpusValues } from '$lib/types/sanity';

// same project/dataset as the opusWorks loader in `./opusWorks`
export const SANITY_URL =
  'https://dn2lfgdt.api.sanity.io/v2022-03-07/data/query/production';

export const opusValuesQuery = `*[_type == "opusValues"][0]{
  description,
  "columns": columns[]{ title, items },
  quote{ text, by }
}`;

// A blank line in the Sanity text field starts a new paragraph —
// rendered as its own `<p class="opus-desc">` so line breaks survive HTML
// whitespace collapsing.
export function splitDescriptionParagraphs(description: string): string[] {
  return description
    .split(/\r?\n\s*\r?\n/)
    .map(para => para.trim())
    .filter(para => para.length > 0);
}

// Minimal `**bold**` + `*italic*` inline markup for the values/about
// descriptions — keeps the Sanity field a plain `text` (no Portable Text
// dependency) while allowing highlighted phrases. HTML is escaped first so
// only our own `<strong>` / `<em>` survive; unmatched markers render
// literally. Bold runs first so its asterisks are consumed before italic.
export function renderRichInline(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '<em>$1</em>');
}

export function normalizeOpusValues(
  raw: SanityOpusValues | null | undefined
): SanityOpusValues | null {
  if (!raw) return null;
  const description = raw.description?.trim();
  const columns = (raw.columns ?? [])
    .map(col => ({
      title: col.title?.trim() ?? '',
      items: (col.items ?? []).map(item => item?.trim()).filter(Boolean),
    }))
    .filter(col => col.title.length > 0 && col.items.length > 0);
  const quoteText = raw.quote?.text?.trim();
  const quoteBy = raw.quote?.by?.trim();
  if (!description && columns.length === 0 && !(quoteText && quoteBy))
    return null;
  return {
    description: description || undefined,
    columns: columns.length > 0 ? columns : undefined,
    quote: quoteText && quoteBy ? { text: quoteText, by: quoteBy } : undefined,
  };
}

// never throws, returns null on failure so callers render nothing.
export async function fetchSanityOpusValues(
  fetchFn: typeof fetch = fetch
): Promise<SanityOpusValues | null> {
  try {
    const res = await fetchFn(
      `${SANITY_URL}?query=${encodeURIComponent(opusValuesQuery)}`
    );
    if (!res.ok) {
      console.error('Failed to fetch opusValues from Sanity', await res.text());
      return null;
    }
    const data = (await res.json()) as { result?: SanityOpusValues | null };
    return normalizeOpusValues(data.result);
  } catch (err) {
    console.error('Error fetching opusValues from Sanity:', err);
    return null;
  }
}
