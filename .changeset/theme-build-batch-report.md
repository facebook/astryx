---
'@astryxdesign/cli': patch
---

[fix] `astryx theme build` with several theme files no longer repeats the same install and font blocks for every theme. It prints each theme's outputs, then the install example once, one import line per theme, and the font guidance once for every font family the themes name but do not load. `--detail compact` or `--detail brief` prints one line per theme. One theme at the default detail, `--json`, and `--check` print what they did before.

@josephfarina
