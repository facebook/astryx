---
'@astryxdesign/cli': patch
---

[docs] `astryx upgrade --help` and the manifest now state how its flags combine: `--list` ignores every other flag, `--registry` refuses `--list` and the migration flags, and `--codemod` is the only way to run an optional codemod and also skips the ShadCN composition check. The `--from` help names the legacy `@xds/core` fallback, and the documented exit codes now include a missing core, a missing jscodeshift, an invalid `astryx.config`, a post-codemod hook failure and the refused flag combinations. (#6590)

@josephfarina
