---
'@astryxdesign/cli': patch
---

[fix] `astryx init` human output is now plain ASCII, including the per-file lines `init --remove-agents` prints. Status lines use `[ok]` instead of a check glyph, and dashes, bullets and arrows print as `-` and `->`. `--json` output is unchanged.

@josephfarina
