---
'@astryxdesign/build': patch
---

[fix] Make source builds fail on unsupported StyleX declarations and load shared StyleX output from every Vite HTML entry.

Nested pseudo-elements and `stylex.keyframes()` now have production-build regression coverage, and the maintained capability registry tracks the installed StyleX version.

@cixzhang
