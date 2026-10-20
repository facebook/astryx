---
'@astryxdesign/core': patch
---

[fix] Source builds through Next.js's Babel no longer fail with `Unknown property: L` (or `Zs`, `Letter`) when the app sets no browserslist or targets a browser without Unicode property escapes. `Avatar`'s initials and the Markdown parser's emphasis and heading-link rules now build their `\p{…}` regular expressions at runtime, as `NumberInput` already does, so there is no literal for Babel to rewrite. Matching is unchanged.
@vjeux
