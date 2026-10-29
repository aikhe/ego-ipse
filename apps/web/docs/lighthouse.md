# Lighthouse follow-up — 2026-10-29

The production build scores **100 in Best Practices on desktop and mobile** in
Lighthouse 13.6.0. Both reports also score 100 in SEO. Accessibility changes were
excluded as requested.

The later [image sharpness follow-up](./image-quality.md) supersedes the poster
thumbnail settings below and records the updated image delivery validation.

These are local Cloudflare Pages build results, not a verification of a new
deployment to `ikerosacay.com`. Deployment and a fresh production audit are still
required to verify Cloudflare's response processing.

## Issue inventory

| Finding                                  | Cause and disposition                                                                                                                                                                                                                                                                                                                                                                                         |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Browser errors logged to the console     | Reproduced the screenshot by blocking Cloudflare's injected `beacon.min.js`. HTML responses now send `Cache-Control: private, no-cache, no-transform`, preserving any existing cache restrictions. This opts HTML out of Cloudflare's automatic analytics injection and email rewriting. No console errors occurred in the final desktop/mobile audits or browser checks.                                     |
| Unrecognized Permissions-Policy features | `private-aggregation` and `attribution-reporting` were already absent from source and the current live response. The existing supported policy remains intact.                                                                                                                                                                                                                                                |
| Inefficient cache lifetimes              | Production flagged the injected Cloudflare beacon and email decoder. The HTML transformation opt-out prevents those injections after deployment. Local final audits pass this check. Fingerprinted assets retain the adapter's one-year immutable cache policy; API cache lifetimes are unchanged.                                                                                                            |
| Improve image delivery                   | Added 64/128px profile images and 288/600px poster candidates alongside the existing 400/800px candidates. Corrected mobile `sizes` to account for column margins and borders. Small profile images remain external cacheable files. Full-resolution overlay assets are unchanged. Desktop passes this check; the final mobile report still estimates savings for dense-display poster and Sanity candidates. |
| Network dependency tree                  | Replaced the Google stylesheet/font chain with the same self-hosted Geist subsets. Preloaded the normal Latin Geist and Geist Mono files. The GitHub contribution request now starts when its section approaches the viewport. The framework's remaining module dependency tree is still reported.                                                                                                            |
| Minify JavaScript                        | Did not reproduce in fresh audits. The existing Vite production configuration already enables esbuild JavaScript and CSS minification.                                                                                                                                                                                                                                                                        |
| Long main-thread tasks / forced reflow   | Removed initial offscreen graph fetching/rendering and its immediate width measurement. Graph sizing now uses ResizeObserver measurements. Mobile still records 170ms total blocking time and a forced-reflow diagnostic; no animation fidelity was reduced.                                                                                                                                                  |
| Layout shifts                            | Local font preloads avoid the external font discovery chain. Final CLS is 0.009 desktop and 0.001 mobile. Section-marker height synchronization remains active.                                                                                                                                                                                                                                               |
| DOM size / LCP breakdown / third parties | Collected as diagnostics. Sanity image delivery remains necessary for CMS content. LCP remains the performance limitation in the final reports.                                                                                                                                                                                                                                                               |
| CSP / HSTS / COOP / Trusted Types        | The screenshot's trust-and-safety entries are unscored hardening diagnostics. Existing nonce CSP and HSTS remain. Font/style CSP sources were tightened to the local origin. This change does not enroll the domain in HSTS preload or add Trusted Types enforcement.                                                                                                                                         |
| Contrast / touch targets                 | Accessibility findings; excluded from this task.                                                                                                                                                                                                                                                                                                                                                              |

Cloudflare documents the transformation opt-out in its
[Web Analytics FAQ](https://developers.cloudflare.com/web-analytics/faq/) and
[email obfuscation documentation](https://developers.cloudflare.com/waf/tools/scrape-shield/email-address-obfuscation/).
The analytics beacon will no longer collect client-side RUM for HTML covered by
this policy.

## Measured limits

The final local desktop Performance score is 98: FCP 0.3s, LCP 1.1s, TBT 0ms.
The mobile Performance score is 88: FCP 1.1s, LCP 3.6s, TBT 170ms.
**A 100 Performance score has not been achieved.** Local Wrangler delivery and
the deployed Cloudflare CDN are different test environments; their timings
should not be treated as a controlled before/after comparison.

Full reports and browser evidence are in `.svelte-kit/lighthouse/`:

- `production-desktop.report.{html,json}` and `production-mobile.report.{html,json}`
- `final-desktop.report.{html,json}` and `final-mobile.report.{html,json}`
- `smoke-results.json`, `final-desktop.png`, and `final-mobile.png`

## Validation

- `bun run build` passes for the monorepo.
- All 10 server tests pass, including HTML transformation protection, CSP
  preservation, and API caching regressions.
- Monorepo lint/type checks pass with existing lint warnings; svelte-check has
  zero errors and warnings.
- Application formatting passes. Unmodified `bun run check` stops at 18
  pre-existing untracked `.agents/skills/` files with formatting issues. Those
  files were left untouched; formatting was rerun excluding `.agents/` and
  `.claude/`, followed by `bunx turbo lint check-types`.
- Browser checks pass with the analytics URL blocked: desktop and mobile
  posters, overlay open/Escape close, theme switching, graph loading on scroll,
  public pages, and work detail navigation. No external font requests occur.
- The graph requests contributions once when near the viewport and renders the
  existing desktop year/mobile six-month windows.

To audit a deployment from `apps/web` in PowerShell:

```powershell
$env:CHROME_PATH = node --input-type=module -e "import { chromium } from 'playwright'; console.log(chromium.executablePath());"
bunx lighthouse https://ikerosacay.com --preset=desktop --only-categories=performance,best-practices,seo --chrome-flags="--headless --no-sandbox" --output=html --output=json --output-path=.svelte-kit/lighthouse/deployed-desktop
```

Omit `--preset=desktop` for mobile. Also retest with the browser's content blocker
enabled and confirm the deployed HTML header includes `no-transform`, no beacon
or email-decoder script is injected, and API/static cache policies are preserved.
