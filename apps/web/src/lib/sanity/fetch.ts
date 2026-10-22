import { sanityQueryUrl } from './config';

interface SanityFetchOptions<Raw, Out> {
  // names the document in failure logs
  label: string;
  query: string;
  params?: Record<string, string>;
  normalize: (raw: Raw | null | undefined) => Out;
  fallback: Out;
}

// runs a GROQ query and passes `result` through `normalize`. never throws:
// any failure is logged and resolves to `fallback`.
export async function fetchSanity<Raw, Out>(
  fetchFn: typeof fetch,
  { label, query, params, normalize, fallback }: SanityFetchOptions<Raw, Out>
): Promise<Out> {
  try {
    const res = await fetchFn(sanityQueryUrl(query, params));
    if (!res.ok) {
      console.error(`Failed to fetch ${label} from Sanity`, await res.text());
      return fallback;
    }
    const data = (await res.json()) as { result?: Raw | null };
    return normalize(data.result);
  } catch (err) {
    console.error(`Error fetching ${label} from Sanity:`, err);
    return fallback;
  }
}
