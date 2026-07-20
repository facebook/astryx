---
'@astryxdesign/cli': patch
---

[feature] template: accept `.template.{ts,mjs,js}` as the canonical suffix for template-spec files, alongside the legacy `.doc.*` suffix. Template specs export `createBlockTemplate`/`createPageTemplate` — a scaffoldable template, not documentation — so they now get a descriptive name. Core, external-package, and integration discovery (`findShowcase`, `--blocks`, `astryx template <id>` scaffolding) all treat `Foo.template.ts` identically to a legacy `Foo.doc.mjs`; same-stem `.tsx` source resolves for either suffix, and `.template.ts` authoring is loaded via jiti. Additive only — no existing files are renamed.

@ejhammond
