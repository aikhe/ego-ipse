import type { SanityOpusValues } from '$lib/types/sanity';
import { fetchSanity } from './fetch';

const query = `*[_type == "opusValues"][0]{
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

function normalizeOpusValues(
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
export function fetchSanityOpusValues(fetchFn: typeof fetch = fetch) {
  return fetchSanity(fetchFn, {
    label: 'opusValues',
    query,
    normalize: normalizeOpusValues,
    fallback: null,
  });
}
