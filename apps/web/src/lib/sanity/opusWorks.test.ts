import { describe, expect, it, vi } from 'vitest';
import { fetchSanityOpusWorks } from './opusWorks';

function worksFetch(assetWidth: number, includeGallery = true) {
  const cell = {
    src: `https://cdn.sanity.io/images/project/production/art-${assetWidth}x1200.webp`,
    assetWidth,
    assetHeight: 1200,
  };
  return vi.fn<typeof fetch>(async () =>
    Response.json({
      result: [
        {
          title: 'Detailed artwork',
          slug: 'detailed-artwork',
          selected: true,
          cells: [cell],
          gallery: includeGallery ? [cell] : [],
        },
      ],
    })
  );
}

describe('work image delivery', () => {
  it('provides dense-display card candidates and a larger detail gallery', async () => {
    const result = await fetchSanityOpusWorks(worksFetch(2400));
    const work = result.sanitySelected[0];

    expect(work?.cells?.[0]?.srcset).toContain('w=1200&q=88&fit=max 1200w');
    expect(work?.cells?.[0]?.srcset).toContain('w=1600&q=88&fit=max 1600w');
    expect(work?.images?.[0]?.srcset).toContain('w=2400&q=88&fit=max 2400w');
  });

  it('does not advertise a candidate wider than the original asset', async () => {
    const result = await fetchSanityOpusWorks(worksFetch(730));
    const cell = result.sanitySelected[0]?.cells?.[0];

    expect(cell?.srcset).toContain('w=730&q=88&fit=max 730w');
    expect(cell?.srcset).not.toMatch(/\b(?:900|1200|1600|2400)w\b/);
    expect(cell?.width).toBe(730);
  });

  it('retains detail resolution when a work reuses its preview images as the gallery', async () => {
    const result = await fetchSanityOpusWorks(worksFetch(2400, false));
    const work = result.sanitySelected[0];

    expect(work?.cells?.[0]?.srcset).not.toContain('2400w');
    expect(work?.images?.[0]?.srcset).toContain('w=2400&q=88&fit=max 2400w');
  });
});
