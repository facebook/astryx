---
'@astryxdesign/cli': patch
---

[fix] The programmatic `component()` API now rejects `detail` and `lang` values that the `astryx component` command rejects, with the same codes (`ERR_INVALID_DETAIL`, `ERR_INVALID_LANG`). It used to fall back silently: an unknown `detail` returned the name list, and an unknown `lang` returned English. (#6576)

@josephfarina
