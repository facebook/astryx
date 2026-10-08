---
'@astryxdesign/cli': patch
---

[fix] Align the layout deprecation (DEP-0006) with the documented envelope and precedent

The layout command's JSON envelope now emits `meta.deprecations: [{id, replacements}]`,
matching the response schema doc and the DEP-0005 theme add precedent. The `deprecated`
CommandDoc field renders in `--help` and the manifest. The programmatic API exports
(`layoutExpand`, `layoutCheck`, `layoutGrammar`) carry `@deprecated` in their declarations
and generated types. Command and function reference pages name DEP-0006 and the replacement.
The DEP-0006 record names its direct authority. All released data fields are unchanged.

@josephfarina
