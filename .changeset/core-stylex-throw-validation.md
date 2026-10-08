---
'@astryxdesign/core': patch
---

[chore] The core build now fails when StyleX rejects a declaration such as a `border`, `background`, or `all` shorthand, instead of silently dropping it from the shipped CSS. The emitted `dist/` is unchanged. No API change.

@kyu-rong
