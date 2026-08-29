---
'@astryxdesign/core': patch
---

[perf] Markdown streaming now parses only the mutable tail of an incremental parse. Splitting, fence detection, link-definition collection, and block re-parsing no longer grow with the already-settled document. The parser contract is unchanged: each call returns a fresh, never-mutated snapshot, and replacing already-settled text still re-parses the document.

@jiunshinn
