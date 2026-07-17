---
'@astryxdesign/cli': patch
---

[feat] Add `createDoc()` component-doc factory, a Zod `ComponentDocSchema`, and a jiti-based loader so component docs can be authored in `.ts` with editor/type feedback and validated at the load boundary. Docs authored with `createDoc(...)` use a default export — the same single-export convention as config/integration/template. Additive: the existing loose doc loader is untouched, so current docs keep loading unchanged during migration.
@ejhammond
