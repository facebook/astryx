---
'@astryxdesign/cli': patch
---

[refactor] CLI Phase 3 — functions own their types, and the public `./api` type surface is generated from them.

- **Colocation:** every command's type shapes live in `api/<cmd>/<cmd>.type.mjs` (the source of truth); each leaf's `@returns` references it, and the central `types/<cmd>.d.ts` files become thin re-exports. Covers all commands (component, hook, docs, discover, template, swizzle, build, upgrade, init, layout, theme, search, doctor, blog, validate-integration) plus their `*Options`.
- **Generation:** `exports["./api"].types` now points at `api/index.d.mts`, generated from the JSDoc via `pnpm gen:api-types` (committed alongside the sources; kept fresh by the `check:api-types-current` CI guard). The hand-written `types/api.d.ts` and the `api.contract.assert.ts` guard are retired — obsolete once the published types derive from the runtime source.
- **No public-surface downgrade:** every previously-exported name (18 functions + 15 `*Options` + `AstryxError`) still resolves from `./api`; the generated surface additionally exposes `themeAdd`/`themeList`/`listThemes` and the response types the hand-written file had omitted.

Types-only reorg — no runtime change.
@josephfarina
