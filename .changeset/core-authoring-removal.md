---
'@astryxdesign/core': minor
---

[breaking] Core — the authoring surfaces move to `@astryxdesign/cli/authoring`. `@astryxdesign/core/authoring` (`createIntegration`/`createPageTemplate`/`createBlockTemplate`/`createComponentDoc`/`createFunctionDoc`/`createDoc` and their types) and `@astryxdesign/core/config` (`createConfig` + `AstryxConfig`) are removed. The doc-type vocabulary re-exported from `@astryxdesign/core` (`ComponentDoc`, `ReferenceDoc`, `ComponentPropDoc`, `ComponentTranslationDoc`, …) is now a deprecated alias that re-exports from `@astryxdesign/cli/authoring` and will be removed next release. Author docs/configs/integrations as plain objects and import types from `@astryxdesign/cli/authoring`; `astryx upgrade` repoints existing imports automatically.

@josephfarina
