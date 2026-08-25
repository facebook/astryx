---
'@astryxdesign/core': patch
---

[perf] Markdown streaming now scans and replaces only the mutable tail of an incremental parse. Splitting, fence detection, link-definition collection, and result assembly no longer grow with the already-settled document.

@jiunshinn
