---
'@astryxdesign/cli': patch
---

[fix] The published `TemplateDoc` type admits an integration template's own `category`, which the loader always accepted and bare `astryx template` groups by; Core templates keep the `TemplateCategory` values.

@josephfarina
