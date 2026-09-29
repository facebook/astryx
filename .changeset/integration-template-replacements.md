---
'@astryxdesign/cli': patch
---

[fix] Keep integration template replacement selection dormant on the 0.6.x line. (#6265, #6626)

The CLI can read and validate future `replaces` declarations, but 0.6.x keeps
released default lookup, list output, and `IntegrationTemplateConflict` behavior
unchanged. Replacement selection and its expanded public response schemas activate
only when the CLI package reaches 0.7.0. Integration packages that set `replaces`
still require `@astryxdesign/cli >=0.7.0`, so earlier stable CLIs are never claimed
as compatible with that metadata.

@josephfarina
