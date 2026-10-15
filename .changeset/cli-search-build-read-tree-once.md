---
'@astryxdesign/cli': patch
---

[perf] `astryx search` and `astryx build`, and the `search` and `build` API functions, read each source directory once per call instead of once per candidate. Results are unchanged. A warm `search` drops from about 1.9 s to 0.4 s on macOS.

@cixzhang
