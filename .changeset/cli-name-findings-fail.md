---
'@astryxdesign/cli': minor
---

[breaking] `astryx integration check --strict` fails on the component name findings it has listed since 0.7.3: `doc_name_mismatch` (a component doc's `name` the module its import names does not export) and `unknown_block_component` (a block's `exampleFor` or `componentsUsed` naming a component no one has). `astryx doctor integration validate` reports them as warnings in `issues`; the `docNames` and `blockComponents` reports keep listing the names they could not judge.

@josephfarina
