---
'@astryxdesign/cli': patch
---

[fix] cli: `astryx doctor` now detects `@astryxdesign/theme-*` packages in pnpm projects. pnpm installs packages as symlinks into `node_modules/.pnpm`, and the theme scan only accepted real directories, so every symlinked theme package was skipped and doctor warned that none were installed (#3530).
@arman-luthra
