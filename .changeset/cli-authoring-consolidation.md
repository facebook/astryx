---
'@astryxdesign/cli': minor
---

[breaking] CLI — authoring is consolidated into a single entrypoint, `@astryxdesign/cli/authoring`, that exposes only TYPES (the plain objects authors write) and PARSERS (the CLI's load-boundary validators). Zod is sealed inside each parser and never exported.

- **The `create*` factories are removed** (`createConfig`, `createIntegration`, `createComponentDoc`, `createFunctionDoc`, `createDoc`, `createPageTemplate`, `createBlockTemplate`, `createCodemod`, `createConfigCodemod`). Author a plain object and stamp its `type` directly (`{type: 'component', ...}`, `{type: 'page', ...}`, `{type: 'code', ...}`); config and integration manifests are plain objects with no discriminant.
- **Import authoring types from `@astryxdesign/cli/authoring`** — `AstryxConfig`, `AstryxIntegration`, `AstryxComponentDoc`, `AstryxTemplate`, `AstryxCodemod`, and the codemod `CodemodTransform` surface. The old split surfaces (`@astryxdesign/cli/{config,doc,integration,template,codemod}` and the authoring exports of `@astryxdesign/core`) are superseded.
- **`astryx upgrade` migrates you automatically.** Two codemods ship in this release: `unwrap-authoring-factories` rewrites every `create*` call to the plain stamped object, and `migrate-authoring-imports` repoints the import specifiers to `@astryxdesign/cli/authoring`.

@josephfarina
