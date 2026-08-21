---
'@astryxdesign/core': patch
---

[fix] plainDateFormat: use a deterministic locale when none is provided

`plainDateFormat` now defaults to the same English fallback as `useLocale()` instead of the runtime locale. Existing calls remain compatible while producing stable server and client output, and provider-aware callers can continue to pass an explicit locale.

@josephfarina
