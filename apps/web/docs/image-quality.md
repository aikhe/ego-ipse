# Image sharpness follow-up

The Lighthouse passes traded image detail for score. Grid posters dropped from
native size to 800px at quality 75, then to 288px on desktop. Work previews
stopped at 900px and quality 75, so dense screens enlarged them. A first fix
moved posters to AVIF, but AVIF smooths the posters' halftone dots into grey.
The full view was also never at native quality: it used lossy WebP, and poster 1
was shrunk to 1600px.

## Posters

- `{n}-full.webp` is the lossless master for each poster, pixel-identical to the
  Paper export (PSNR infinite). It serves the full-view overlay, `/ipse` and its
  poster scene, and the largest grid slots. Lossless WebP is half the size of the
  PNG exports (1.6MB vs 3.1MB for all four), so the repo no longer keeps PNGs.
- Grid previews at 400, 600 and 800px use near-lossless WebP (level 60) made
  from the master. At the same size they match a PNG resize (SSIM 0.9995 on
  poster 3), where lossy WebP q92 visibly loses faint dots. There are no AVIF
  candidates.
- The masters are 1424px wide, matching the current exports. A full-height
  overlay on a 2x screen needs about 1800–1950 pixels of height, so 2x exports
  would sharpen it further. After exporting at a new size, update `FULL_WIDTH`
  in `posterImages.ts`.

Replace posters from new exports named `001.png` to `004.png`, or regenerate
previews from the existing masters by omitting the parameter:

```powershell
powershell -File apps/web/scripts/generate-poster-previews.ps1 -ExportDirectory <folder>
```

## Works

- Work cards use native lazy-image `sizes="auto"` with layout-aware fallbacks.
  Card candidates extend to 1600px, detail candidates to 2400px, bounded by the
  original asset width. Transformations use quality 88 with Sanity's automatic
  format negotiation. At the same size, the output is visually indistinguishable
  from the original upload.
- Detail galleries now consume `srcset`, including when a work reuses its card
  images as the gallery.
- Work API requests and cache entries carry the `images-hq` representation
  version, so the old quality-75 URLs are not served from cache. Other API cache
  policies are unchanged, and arbitrary query parameters do not create new
  upstream fetches in the canonical cache.

## Validation

Local Lighthouse 13.6.0 runs, using the same configuration as the earlier image
pass:

| Profile | Earlier pass (AVIF) | This change      | Best Practices | SEO |
| ------- | ------------------- | ---------------- | -------------- | --- |
| Desktop | 98                  | 99               | 100            | 100 |
| Mobile  | 87                  | 86, 91, 83 (med) | 100            | 100 |

The mobile LCP element is the first poster's 600px preview: 106KB near-lossless
WebP versus 64KB AVIF. Median simulated mobile LCP rose from 3.7s to 4.0s. This
is the cost of keeping the halftone detail. Desktop LCP improved to 0.9s. Scores
vary between local runs, and production verification is still required after
deployment.

Browser checks (`smoke.json`, `works.json`):

- The grid selects 600px at 1350@2x and 412@1.75x, and the lossless full at
  390@3x. The overlay loads the 1424px master. No AVIF or PNG poster requests.
- `/ipse` loads the four masters as overlay images and scene textures, with no
  console errors.
- Work cards and detail galleries cover their slots without enlargement
  (coverage 1.0–1.2) at 1920@1x, 1350@2x, 900@2x, and 390@3x.

All 16 server tests pass. Build, lint, and type checks pass; svelte-check has
zero errors and warnings. Evidence is saved under
`.svelte-kit/lighthouse/sharp-posters/`.

Relevant platform documentation:

- [Responsive image selection and density](https://web.dev/articles/serve-responsive-images)
- [Lazy images and automatic sizes](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/sizes)
- [Sanity image transformations](https://www.sanity.io/docs/apis-and-sdks/image-urls)
- [WebP lossless and near-lossless encoding](https://developers.google.com/speed/webp/docs/cwebp)
