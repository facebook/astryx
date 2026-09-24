---
'@astryxdesign/cli': patch
---

[fix] `astryx upgrade` human output is now plain ASCII. Progress and codemod lines use `[ok]`, `!` and `!!` instead of check, warning and cross glyphs, and dashes and arrows print as `-` and `->`, including in codemod titles listed by `--list`. `--json` output is unchanged.

@josephfarina
