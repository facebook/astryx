---
'@astryxdesign/cli': patch
---

[fix] swizzle: copy a component's nested source directories instead of silently dropping them. `swizzle Table` copied only the 17 top-level files and skipped `plugins/`, so the ejected `index.ts` re-exported `./plugins/*` paths that were never written — a broken eject reported as success. The copy now walks the whole component tree (47 files for `Table`), and one recursive walk backs the pre-flight collision check, the copy loop and the reported file list so they cannot drift apart. Import rewriting is resolved from each file's own directory, so a nested `../../types` stays intact while `../../../theme/tokens.stylex` still becomes `@astryxdesign/core/theme`; a specifier reaching past the package source root is left alone rather than rewritten to `@astryxdesign/core/..`. Test scaffolding directories (`__tests__`, `__snapshots__`, `__mocks__`, `__fixtures__`) and symlinks are skipped.

@AKnassa
