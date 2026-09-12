---
'@astryxdesign/cli': patch
---

[feature] Add integration authoring and packed-package verification. `astryx integration add <kind> <name>` and the per-kind `integrationAddComponent`, `integrationAddDoc`, `integrationAddTemplate`, `integrationAddCodemod`, `integrationAddAgentDoc`, and `integrationAddTheme` APIs write complete contributions. Existing component, docs, template, and theme commands see the package being authored without publishing it first. `astryx integration pack --check` proves the same contributions survive the npm tarball and that packed components remain available through their public imports. Doctor now names source-only components, unreachable metadata, codemods outside a version folder, and invalid version folders.
@josephfarina
