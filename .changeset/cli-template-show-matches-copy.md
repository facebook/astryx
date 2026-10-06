---
'@astryxdesign/cli': patch
---

[fix] `astryx template <name>` and `template()` now return the same source that `astryx template <name> <path>` writes, and say how many Astryx demo media references they replaced. Demo images and videos that only Astryx's own previews serve are replaced the same way in both, so code copied from the printed source no longer points at media your project doesn't have. `template.show` gains `demoMediaReplaced` (0 when the template carried none); in text mode the count is stated on stderr so the printed source stays exact.

@josephfarina
