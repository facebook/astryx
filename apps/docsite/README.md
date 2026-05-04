# XDS Docsite

The OSS documentation site for XDS. Built with Next.js and StyleX.

## Quick Start

```bash
yarn install     # from repo root
yarn build       # build all packages (themes need built exports)
cd apps/docsite
yarn generate    # extract data from the monorepo into src/generated/
yarn dev         # start the dev server
```

`yarn dev` and `yarn build` both run `generate` automatically via `predev`/`prebuild` scripts.

## How It Works

The docsite never hardcodes package lists, component catalogs, or theme maps.
Everything flows through a build-time **data pipeline** that extracts information
from the monorepo and writes typed TypeScript registries to `src/generated/`.

### The Pipeline

`scripts/generate-data.mjs` scans the monorepo and produces:

| Registry               | Source                            | What it contains                                              |
| ---------------------- | --------------------------------- | ------------------------------------------------------------- |
| `packageRegistry.ts`   | `packages/*/package.json`         | Name, version, description, README for each published package |
| `componentRegistry.ts` | `*.doc.mjs` files                 | Props, usage docs, hooks, groups — per package                |
| `blockRegistry.ts`     | CLI `templates/blocks/`           | Showcase and example blocks with metadata                     |
| `templateRegistry.ts`  | CLI `templates/pages/`            | Page-level templates (e.g. dashboard, settings)               |
| `docsRegistry.ts`      | CLI `docs/`                       | Long-form guide and foundation topics                         |
| `themeRegistry.ts`     | Installed `@xds/theme-*` packages | Built theme objects, keyed by package name                    |
| `showcaseRegistry.ts`  | Blocks with `isShowcase`          | Copied showcase source files                                  |
| `exampleRegistry.ts`   | Blocks with `exampleFor`          | Copied example blocks per component                           |

The `src/generated/` directory is gitignored. Pages import from these registries
and render whatever the pipeline found — no manual wiring needed.

### The Rule

**All data comes from the pipeline. Never hardcode package names, component
lists, or theme objects in page code.** If you need data about the monorepo,
add it to `generate-data.mjs` and consume it from a registry.

This means:

- No `import {fooTheme} from '@xds/theme-foo/built'` in page files — use `themeObjects` from the generated `themeRegistry`
- No hand-maintained arrays of component names — use `componentRegistry`
- No `if (pkg === '@xds/core')` switches — let the pipeline classify packages

## Adding a New Theme

1. Create the theme package under `packages/themes/<name>/`
2. Add `"@xds/theme-<name>": "*"` to `apps/docsite/package.json` dependencies
3. Add `@import "@xds/theme-<name>/theme.css"` to `src/app/globals.css`
4. Add the theme's Google Fonts to the `<link>` tag in `src/app/layout.tsx`
5. Run `yarn generate` — the theme appears in `themeRegistry.ts`, `packageRegistry.ts`, the sidebar, craft page, and package detail page automatically

Step 4 is easy to miss. Each theme declares font families in its source (e.g.
`family: 'Fraunces'`). If those fonts aren't loaded, the theme silently falls
back to system fonts. The docsite loads all theme fonts from Google Fonts via a
single `<link>` in `layout.tsx` — add any new families there.

> Only add **public** (non-private) theme packages to the docsite.

## Adding a New Package

1. Create the package under `packages/<name>/`
2. Add `"@xds/<name>": "*"` to `apps/docsite/package.json` dependencies
3. Run `yarn generate`

The package appears in the sidebar, the libraries section, and gets its own
`/packages/<name>` detail page. If the package contains `.doc.mjs` files,
its components are extracted into `componentRegistry.ts` as well.

## Project Structure

```
apps/docsite/
├── scripts/
│   └── generate-data.mjs    # The data pipeline
├── src/
│   ├── generated/            # gitignored — pipeline output
│   ├── app/
│   │   ├── globals.css       # CSS imports (reset, xds base, theme stylesheets)
│   │   ├── layout.tsx        # Root layout
│   │   ├── providers.tsx     # XDSTheme + client providers
│   │   ├── (docs)/           # Main docs routes (components, packages, docs)
│   │   └── craft/            # Craft landing (templates, themes, showcases)
│   └── components/           # Shared UI components
├── package.json
└── .gitignore                # Excludes src/generated/
```

## Commands

| Command           | What it does                                    |
| ----------------- | ----------------------------------------------- |
| `yarn generate`   | Run the data pipeline                           |
| `yarn dev`        | Start Next.js dev server (auto-generates first) |
| `yarn build`      | Production build (auto-generates first)         |
| `yarn typecheck`  | Run `tsc --noEmit`                              |
| `yarn test`       | Run vitest                                      |
| `yarn test:watch` | Run vitest in watch mode                        |

## Testing

Tests live in `src/__tests__/data-extraction.test.ts` and validate the generated
registries — package discovery, component extraction, theme wiring, etc. Run
`yarn generate` before running tests since they import from `src/generated/`.
