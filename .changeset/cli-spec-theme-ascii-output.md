---
'@astryxdesign/cli': patch
---

[fix] `astryx theme build` and `astryx theme palette generate` now print plain ASCII: status lines use `[ok]`, `[warn]`, `[error]`, `[fail]`, and `[note]` markers instead of symbol glyphs, and theme build messages drop em dashes and ellipses. The reworded font and private-variable messages also appear in the `--json` receipt's `notices` and `warnings`. Generated theme files are unchanged. (#6544)

@josephfarina
