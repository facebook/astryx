---
applyTo: "apps/docsite/**"
---

# Docsite review instructions

The docsite (`apps/docsite/`) is a Next.js + StyleX app that documents Astryx.
Its defining constraint is **how it handles data** — review against
[`apps/docsite/README.md`](../../apps/docsite/README.md), specifically the
"How It Works" and "The Rule" sections.

## The data rule (primary review focus)

**All data comes from the build-time pipeline. Never hardcode package names,
component lists, or theme objects in page code.**

`scripts/generate-data.mjs` scans the monorepo and writes typed registries into
`src/generated/` (which is gitignored). Pages import from those registries and
render whatever the pipeline found. If a change needs data about the monorepo,
it belongs in `generate-data.mjs` and is consumed from a registry — not inlined
in a page.

Flag as violations:

- Importing a built theme directly in a page (e.g.
  `import {fooTheme} from '@astryxdesign/theme-foo/built'`). Use `themeObjects`
  from the generated `themeRegistry` instead.
- Hand-maintained arrays of component names. Use `componentRegistry`.
- Package-name switches like `if (pkg === '@astryxdesign/core')`. Let the
  pipeline classify packages.
- Any hardcoded package/version/description that duplicates what
  `packageRegistry`, `blockRegistry`, `templateRegistry`, `docsRegistry`, or
  `showcaseRegistry` already provide.

New source? The registries auto-discover it: a new theme package or a new
`packages/<name>/` is picked up by `pnpm generate` after it's added to
`apps/docsite/package.json` dependencies — no manual page wiring.

## Blog content

Blog posts are human-authored Markdown under `src/content/blog/posts/` with
validated YAML frontmatter (`title`, `description`, `date`, `type`, `authors`,
`tags`). Follow
[`src/content/blog/README.md`](../../apps/docsite/src/content/blog/README.md);
new authors register in `src/content/blog/authors.ts`. Drafts
(`draft: true`) are excluded from production output.

## Everything else

Standard Astryx expectations still apply: StyleX only (no raw CSS), semantic
tokens, compose from Astryx components rather than raw HTML, and keep code
comments minimal. Docsite-only or CLI-docs-only changes are a light review —
the data-from-pipeline rule and component purity are the main gates.
