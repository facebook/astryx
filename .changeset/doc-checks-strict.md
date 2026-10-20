---
'@astryxdesign/cli': minor
---

[breaking] `integration check --strict` now fails on copied passages and fluff in an integration's docs. Each `copiedPassages` and `fluff` entry from `doctor integration docs` is also a warning issue, `copied_passage` or `doc_fluff`, with the fix in its message. A package whose build passed before can fail until its docs keep one fact in one topic and cut padding phrases; run `npx astryx doctor integration docs` to see each one.
@josephfarina
