---
'@astryxdesign/core': patch
---

[feat] Add the first-party Markdown heading-links identity module.

`createMarkdownHeadingLinks()` is exported from `@astryxdesign/core/Markdown/plugins` and gives every rendered h1–h6 a deterministic, collision-safe ID after transforms, including headings nested in blockquotes and lists. Its frozen, versioned entry carries the caller namespace across compatible Core package copies without module-local state. The same opaque plugin entry keeps Markdown-derived Outline aligned, supports Unicode NFKC slugs and an optional caller-owned namespace, and leaves default Markdown plus custom heading anatomy unchanged.

@cixzhang @vjeux
