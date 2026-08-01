---
'@astryxdesign/cli': minor
---

[breaking] CLI — authoring is consolidated into a single entrypoint, `@astryxdesign/cli/authoring`, that exposes only TYPES (the plain objects authors write) and PARSERS (the CLI's load-boundary validators). Zod is sealed inside each parser and never exported.

- **The `create*` factories are removed** (`createConfig`, `createIntegration`, `createComponentDoc`, `createFunctionDoc`, `createDoc`, `createPageTemplate`, `createBlockTemplate`, `createCodemod`, `createConfigCodemod`). Author a plain object and stamp its `type` directly (`{type: 'component', ...}`, `{type: 'page', ...}`, `{type: 'code', ...}`); config and integration manifests are plain objects with no discriminant.
- **Import authoring types from `@astryxdesign/cli/authoring`** — the doc types `ComponentDoc`, `HookDoc`, `ReferenceDoc`, `TemplateDoc`, and the project-file types `AstryxConfig`, `AstryxIntegration`, `AstryxCodemod`. The old split surfaces (`@astryxdesign/cli/{config,doc,integration,template,codemod}` and the authoring exports of `@astryxdesign/core`) are superseded.
- **Doc field types are renamed to explicit, domain-prefixed names** so the surface reads clearly: `PropDoc → ComponentPropDoc`, `ThemingTarget → ComponentThemingTarget`, `ComponentVar → ComponentThemingVar`, `DerivedVar → ComponentThemingDerivedVar`, `ElementDescriptor → ComponentSlotElement`, `GroupDoc → ComponentGroupDoc`, `TranslationDoc → ComponentTranslationDoc`, `ExampleDoc/AnatomyElement/BestPractice/PlaygroundConfig → Component*`, and `ContentBlock/TokenPreviewType → Reference*`. The authorable entry types (`ComponentDoc`/`HookDoc`/`ReferenceDoc`/`TemplateDoc`) are unchanged.
- **`astryx upgrade` migrates you automatically.** Three codemods ship in this release: `unwrap-authoring-factories` rewrites every `create*` call to the plain stamped object, `migrate-authoring-imports` repoints the import specifiers to `@astryxdesign/cli/authoring`, and `rename-authoring-doctypes` applies the doc field-type renames (imports, type references, and JSDoc `@type` refs).

@josephfarina
