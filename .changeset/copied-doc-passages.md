---
'@astryxdesign/cli': patch
---

[feat] `doctor integration docs` (and so `integration check`) lists each pair of topics that repeat 10 or more words of prose word for word: two of the package's own topics, or one of them and a Core topic other than the one it replaces. Each entry names both topics and the fix (keep the passage in one topic, link to it from the other), and is in the new `copiedPassages` field. It is information only and never fails a check.
@josephfarina
