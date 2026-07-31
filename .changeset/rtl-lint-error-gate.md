---
'@astryxdesign/core': patch
---

[fix] The RTL physical→logical migration is complete, so promote the `@astryx/no-physical-properties` lint rule from `warn` to `error` in both the recommended and strict tiers. This gates against future physical-property regressions now that the core package is clean (the one sanctioned physical suppression lives in `rtlStyles.centerInline`).
@nynexman4464
