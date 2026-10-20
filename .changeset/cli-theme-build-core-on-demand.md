---
'@astryxdesign/cli': patch
---

[perf] The CLI loads Core's runtime (`@astryxdesign/core` and `@astryxdesign/core/theme`) only when it builds or checks a theme (`theme build`, and the `doctor` and `integration pack` theme checks), not on every start. In a project with Core installed, every other command, and an import of `@astryxdesign/cli/api`, skips loading Core's components and React: `astryx --version` drops from about 1.3 s to 0.5 s. Output is unchanged.

@josephfarina
