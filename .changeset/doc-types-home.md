---
'@astryxdesign/core': patch
---

[feat] Add `@astryxdesign/core/doc-types` — the single home for the doc-type shapes + `create*` authoring factories

New public entry `@astryxdesign/core/doc-types` exposes the doc-type shapes (`ComponentDoc`, `HookDoc`, `GroupDoc`, `TranslationDoc`, `TemplateDoc`, `ReferenceDoc`, plus shared leaves like `PropDoc`/`UsageDoc`) alongside `create*` authoring factories (`createComponentDoc`, `createHookDoc`, ...). Each shape is also importable directly via a wildcard subpath, e.g. `import { createComponentDoc } from '@astryxdesign/core/doc-types/ComponentDoc'`.

The definitions now live in `doc-types/` (one file per shape); `docs-types.ts` is a thin re-export, so existing imports and the `@astryxdesign/core` main-entry re-exports keep working.

The doc factories and input types in `@astryxdesign/core/authoring` (`createComponentDoc` / `createFunctionDoc` / `createDoc` + the `Astryx*Input` types) are now `@deprecated` in favor of `doc-types` — behavior is unchanged and they still work, but new code should use `doc-types`. `createIntegration` and the template factories are unaffected (they are not doc types).

@josephfarina
