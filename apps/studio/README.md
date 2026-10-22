# Studio

Sanity Studio for the Ego Ipse content (project `dn2lfgdt`, dataset `production`). Schemas live in `schemaTypes/` and mirror the types in `apps/web/src/lib/types/`.

## Develop

```sh
bun run dev
```

## Seed scripts

`scripts/seed-*.mjs` write to the **production** dataset. Put an Editor `SANITY_TOKEN` in `.env.local` (gitignored, never commit it) and run from `apps/studio`:

```sh
bun --env-file=.env.local scripts/<name>.mjs
```

`scripts/apply-works-manifest.mjs` is a dry run unless passed `--apply`. Shared client helpers live in `scripts/_client.mjs`.

`seed-assets/` holds the source images the seed scripts upload to Sanity. They are not used by the web app.
