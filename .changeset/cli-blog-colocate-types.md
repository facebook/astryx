---
'@astryxdesign/cli': patch
---

[refactor] CLI: colocate every command's types with its API. Each command now owns its type shapes in a `<cmd>.type.mjs` next to its leaves — the source of truth for its response/data types — and the leaves' `@returns` reference it directly ("functions own their types"). Covers component, hook, docs, discover, template, swizzle, build, upgrade, init, layout, theme, search, doctor, and blog. The central `types/<cmd>.d.ts` files are reduced to thin re-exports of the colocated typedefs, so the `@astryxdesign/cli/api` (`types/api.d.ts`) and `./json` (`types/index.d.ts`) public surfaces resolve the same names unchanged. Types-only reorg — no runtime change.
@josephfarina
