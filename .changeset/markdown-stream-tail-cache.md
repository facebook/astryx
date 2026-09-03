---
'@astryxdesign/core': patch
---

[perf] Markdown streaming bounds four incremental-parse operations by the mutable tail: splitting, fence/boundary detection, link-definition collection, and block re-parsing no longer grow with the already-settled document. The parser contract is unchanged: each call returns a fresh, never-mutated snapshot, and replacing already-settled text still re-parses the document. Two costs intentionally remain proportional to the whole input on each call because that contract requires them — the settled-prefix comparison that detects a replaced document, and the pointer-per-block copy behind each returned snapshot.

@jiunshinn
