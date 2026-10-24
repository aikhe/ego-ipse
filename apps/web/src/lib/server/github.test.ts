import { afterEach, describe, expect, it, vi } from 'vitest';
import { getRepoStars } from './github';

function githubFetch(results: Array<number | 'fail'>) {
  return vi.fn<typeof fetch>(async () => {
    const next = results.shift();
    return next === 'fail' || next === undefined
      ? new Response('rate limited', { status: 403 })
      : Response.json({ stargazers_count: next });
  });
}

describe('getRepoStars', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('reuses a fresh count instead of calling github again', async () => {
    const repo = 'https://github.com/aikhe/memo.nvim';
    const fetchFn = githubFetch([12]);
    await getRepoStars(fetchFn, [repo]);
    const again = await getRepoStars(fetchFn, [repo]);
    expect(again).toEqual({ stars: { [repo]: 12 }, ok: true });
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it('falls back to the last good count when github fails', async () => {
    vi.useFakeTimers();
    const repo = 'aikhe/stale.nvim';
    const fetchFn = githubFetch([7, 'fail']);
    await getRepoStars(fetchFn, [repo]);
    vi.advanceTimersByTime(60 * 60 * 1000);
    const stale = await getRepoStars(fetchFn, [repo]);
    expect(stale).toEqual({ stars: { [repo]: 7 }, ok: true });
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it('flags a repo with no count and skips non-github values', async () => {
    const repo = 'https://github.com/aikhe/never.nvim';
    const result = await getRepoStars(githubFetch(['fail']), [
      repo,
      'https://gitlab.com/someone',
    ]);
    expect(result).toEqual({ stars: {}, ok: false });
  });
});
