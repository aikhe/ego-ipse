// read-only cdn endpoint for the public production dataset
export const SANITY_URL =
  'https://dn2lfgdt.apicdn.sanity.io/v2022-03-07/data/query/production';

// builds a query url; `params` become GROQ `$name` parameters (json-encoded per sanity's api).
export function sanityQueryUrl(
  query: string,
  params: Record<string, string> = {}
): string {
  const search = new URLSearchParams({ query });
  for (const [name, value] of Object.entries(params)) {
    search.set(`$${name}`, JSON.stringify(value));
  }
  return `${SANITY_URL}?${search}`;
}
