# Web

SvelteKit frontend for Ego Ipse, deployed to Cloudflare Pages. Content comes from Sanity (`apps/studio`).

## Develop

```sh
bun run dev
```

## Validate

```sh
bun run check-types
bun run lint
bun run test
bun run build
```

`bun run preview` serves the Cloudflare build locally with wrangler.
