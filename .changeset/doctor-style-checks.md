---
'@astryxdesign/cli': patch
---

[feat] `astryx doctor` gains two style checks: `stylex-compiler` fails when no StyleX compiler integration is detectable (declared but not installed, or neither a compiler dependency nor a bundler config referencing StyleX), and `token-literals` warns when project source under `src/` uses raw color literals instead of design tokens. (#6715, #6720)
@kiranbadam
