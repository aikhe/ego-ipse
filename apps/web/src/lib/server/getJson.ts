// fetches a same-origin api route (see src/routes/api). null on a non-ok
// response or network error so each section of a page settles on its own.
export async function getJson<T>(
  fetchFn: typeof fetch,
  path: string
): Promise<T | null> {
  try {
    const res = await fetchFn(path);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
