---
'@astryxdesign/cli': patch
---

[fix] `parentDoc` in `astryx component <Name> --json` is now a documented part of the `component.detail` response. The field appears when a sub-component such as `HStack` is scoped out of its parent's doc. It is in the published response type and the `component()` reference, and the text output now shows it as `parentDoc: Stack`.

@josephfarina
