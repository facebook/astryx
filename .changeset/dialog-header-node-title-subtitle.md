---
'@astryxdesign/core': patch
---

[feat] `DialogHeader` `title` and `subtitle` now accept any `ReactNode`, not only strings.

A title can carry inline markup and still renders inside the focusable `h2` that
receives focus on open and names the Dialog; the accessible name is the title's
text content. A subtitle can carry inline content such as a `Link`. String
callers are unchanged. An empty-string, boolean, or nullish subtitle renders
nothing, and a numeric `0` subtitle now renders inside the subtitle text.

@ksying
