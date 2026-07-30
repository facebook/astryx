---
'@astryxdesign/core': patch
---

[feat] TreeList: the per-level indentation step is now the themeable `--tree-list-indent` variable (default `var(--spacing-4)`), so a theme can retune the indent metric via `defineTheme` on the `tree-list` target instead of the previously hardcoded, unreachable step (#4308).
@cixzhang
