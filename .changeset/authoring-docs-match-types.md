---
'@astryxdesign/cli': patch
---

[docs] `astryx docs authoring` now matches the published authoring types field for field, and a test keeps it that way: every field is listed, with its real type and whether it is required. Three entries were wrong: a component doc's `usage` is optional on sub-component docs, a command option's `default` may also be a boolean or a list, and a codemod's `type` is `'code'` or `'config'`. (#6492)

@josephfarina
