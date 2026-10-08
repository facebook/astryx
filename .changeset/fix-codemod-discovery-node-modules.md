---
'@astryxdesign/cli': patch
---

[fix] upgrade: exclude node_modules from integration codemod discovery
@josephfarina

When an integration declared its codemods root as the package root (`codemods: "./"`), the version-folder scan treated `node_modules`, `.git`, `__tests__`, and `__fixtures__` as version folders and loaded their files as codemods. The same `SKIP_DIRS` filter that the recursive file walk already used is now also applied to the top-level version-folder enumeration.
