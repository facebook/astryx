---
'@astryxdesign/cli': patch
---

[feat] Add the finalized doc-authoring API to `@astryxdesign/cli/doc`: `createComponentDoc`, `createFunctionDoc` (any function, including hooks), and `createDoc` (generic reference/topic docs). Each factory stamps a `type` discriminant and is validated at the load boundary against a matching per-kind schema. The legacy loose `export const docs = {...}` format keeps loading unchanged, and `.ts`-authored hook/function sources now derive their import path to a tree-shakeable subpath instead of the bare package root.
@ejhammond
