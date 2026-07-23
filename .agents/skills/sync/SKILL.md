---
name: sync
description: Synchronizes Sanity CMS schemas with SvelteKit data fetching. Use when modifying content models or updating frontend data queries.
---

# Sync Skill

This skill ensures that the data layer (Sanity) and the presentation layer (SvelteKit) remain in perfect synchronization.

## When to use this skill

- Use this when adding or modifying Sanity schemas in `apps/studio`.
- Use this when updating GROQ queries or data fetching logic in `apps/web`.
- Use this to verify that content-driven pages have access to the correct data fields.

## How to use it

### 1. Schema Updates

- When modifying a schema, check all references in the frontend.
- Proactively suggest updates to TypeScript types if the data structure changes.

### 2. Data Validation

- Ensure that for every new Sanity field, there is a corresponding UI element or state update.
- Use the `studio` app to verify that sample content matches the frontend requirements.

## Data Flow Pattern

- Sanity schemas in `apps/studio/schemaTypes/` define the content model.
- SvelteKit fetches data via GROQ queries in `src/routes/` page server files (`+page.server.ts`).
- TypeScript types for Sanity data live in `$lib/types/sanity.ts` and related type files.
- The `project`, `social`, and other types in `$lib/types/` mirror the Sanity schema structures.

## Troubleshooting

- If a query returns `null`, verify the field name in the Sanity schema.
- Ensure that the Sanity dataset (e.g., `production`) matches the one configured in the SvelteKit environment variables.
- After schema changes, regenerate TypeScript types if using a codegen setup; otherwise manually sync type definitions in `$lib/types/`.
