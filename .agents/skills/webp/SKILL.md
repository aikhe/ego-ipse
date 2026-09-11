---
name: webp
description: Converts PNG/JPG assets to webp, wires them into work previews, and deletes the unused sources. Use when adding or replacing work preview images.
---

# Webp Skill

This skill covers the full lifecycle of work preview images: convert sources to webp, reference them in `apps/web/src/lib/data/works.ts`, verify, then delete the orphaned originals.

## When to use this skill

- Use this when a work folder (e.g. `apps/web/src/lib/assets/works/<name>/`) has new PNG/JPG images.
- Use this when swapping a work's preview images.
- Use this to clean up image files left orphaned by a swap.

## How to use it

### 1. Inspect the sources

- List the folder and record every image plus its dimensions.
- Dimensions are required for the `width` / `height` fields in `works.ts` (they lock the preview aspect ratio).
- On Windows without imaging tools, read dimensions via `System.Drawing`:
  `Add-Type -AssemblyName System.Drawing` then `New-Object System.Drawing.Bitmap($path)`.

### 2. Convert to webp

- No converter is installed in the repo, so use `sharp-cli` ephemerally (no `package.json` changes):
  `bunx -p sharp-cli sharp --input "<src>" --output "<dir>" --format webp`
- Keep webp files next to the sources (same folder, same basename, `.webp` extension).
- Spot-check output sizes; webp should be clearly smaller than the PNG.

### 3. Wire into the work preview

- In `apps/web/src/lib/data/works.ts`, import each webp:
  `import <work>1 from '$lib/assets/works/<folder>/1.webp';`
- Replace the work's `cells` with one entry per image, each with real `width`, `height`, and `ratio`.
- Grid shape follows the cell count and the `preview` flag: the preview grid is 2 columns, so 6 cells render as a 3x2 grid. Cells default to single-column only when `preview` is `4` (`1`/`2` force full-width cells, `3` forces the last cell full-width).
- Do not reuse the old import variable name for new files.

### 4. Verify before deleting anything

- Run `bunx eslint "src/lib/data/works.ts"` from `apps/web`.
- Run `bun run build` from `apps/web` — it fails on missing/unresolved imports, proving the wiring is correct.

### 5. Delete the unused originals

- Only after the build passes, search for references with ripgrep (the editor grep tool is unreliable for asset paths — prefer `rg`):
  `rg -n "<name>\.(webp|png)" apps/web/src apps/studio`
- Delete the source PNGs/JPGs and any orphaned webp with zero references.
- Never delete files under `apps/web/src/lib/assets/projects/` on a webp task — that folder belongs to a different feature and may be CMS-referenced.
- Re-run the build after deletion as a final safety net.

## Troubleshooting

- `sharp-cli` needs network access on first use (downloads `sharp`); subsequent runs use the cache.
- If `rg` matches look wrong, quote the pattern and check for the `sola/1.webp` vs `sola.webp` substring trap — always include the extension in the pattern.
- If the preview grid renders full-width rows instead of 2 columns, the work's `preview` flag is `1`/`2` — set it to `4`.
