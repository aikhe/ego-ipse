---
description: Automated process to run workspace-specific linting and resolve technical diagnostics like Svelte navigation or TypeScript types.
---

# Format and Lint Workflow

**Description**: Automated process to run workspace-specific linting and resolve technical diagnostics like Svelte navigation or TypeScript types.

## Steps

1. **Environmental Cleanup**: Identify the relevant package directory (e.g., `apps/web` or `apps/studio`).
2. **Execute Formatting & Linting**:
   - Run `bun run format` from the workspace root to auto-fix prettier + lint issues.
   - This runs `bun run prettier:fix; turbo lint:fix` under the hood.
3. **Run Full Check**:
   - Run `bun run check` to verify prettier formatting + turbo lint pass clean.
   - This runs `bun run prettier; turbo lint` under the hood.
4. **Manual Resolution**:
   - Resolve any remaining `@typescript-eslint/no-explicit-any` errors.
   - Fix any `svelte/no-navigation-without-resolve` issues.
5. **Style Guarantee**:
   - Verify that `order/properties-alphabetical-order` is respected in all modified CSS files.
   - Ensure `selector-class-pattern` adheres to the BEM standard.
6. **Final Check**: Run `bun run check` to confirm zero diagnostics before finishing.
7. **CI Verification**: Ensure all changes pass the remote CI pipeline (CI runs `bun run check` then `bun run build`).
