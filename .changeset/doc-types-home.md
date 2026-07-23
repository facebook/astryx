---
'@astryxdesign/core': patch
---

[feat] Add `@astryxdesign/core/doc-types` — a single home for the doc-type shapes + `create*` authoring factories

New public entry `@astryxdesign/core/doc-types` exposes the doc-type shapes (`ComponentDoc`, `HookDoc`, `GroupDoc`, `TranslationDoc`, `TemplateDoc`, `ReferenceDoc`, plus shared leaves like `PropDoc`/`UsageDoc`) alongside `create*` authoring factories (`createComponentDoc`, `createHookDoc`, ...). Each shape is also importable directly via a wildcard subpath, e.g. `import { createComponentDoc } from '@astryxdesign/core/doc-types/ComponentDoc'`.

Additive and non-breaking: the existing `@astryxdesign/core` doc-type re-exports and the `@astryxdesign/core/authoring` factories are unchanged. This is the foundation for consolidating doc typing (currently defined in several parallel places) into one home.

@josephfarina
