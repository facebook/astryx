# JEDI example consumer

Minimal reference for consuming **only** `@jedi/*` public APIs in a Next.js app.

This validates [v0.1 success criteria](../docs/VISION.md#v01-success-criteria): a second application can be created without changing JEDI internals.

## Setup

```bash
# From JEDI monorepo root (after build)
pnpm install
pnpm build:jedi
```

In your Next.js app:

```json
{
  "dependencies": {
    "@jedi/core": "0.1.0",
    "@jedi/react": "0.1.0",
    "@jedi/themes": "0.1.0",
    "@jedi/tokens": "0.1.0"
  }
}
```

Use workspace linking during development:

```json
"@jedi/core": "workspace:*"
```

## Providers

See [docs/PUBLIC_API.md](../docs/PUBLIC_API.md).

## Portfolio

[jon-ohio-portfolio](https://github.com/jon4ohio/jon-ohio-portfolio) is the production **reference application** for JEDI v0.1.
