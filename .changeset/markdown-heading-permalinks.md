---
'@astryxdesign/core': patch
---

[feat] Add the first-party Markdown heading-links module.

`createMarkdownHeadingLinks()` is exported from `@astryxdesign/core/Markdown/plugins` and gives every built-in h1–h6 a collision-safe generated fragment plus an accessible inline trailing `#` copy button, including headings nested in blockquotes and lists. Its frozen, versioned entry carries the namespace and safe URL base across compatible Core package copies without module-local state. The heading row uses `useContainerReveal`: the button is hidden at fine-pointer rest, reveals on row hover or keyboard focus, and follows the canonical coarse/touch behavior. An unmodified tap, click, Enter, or Space copies the canonical URL without navigating, scrolling, or mutating the hash and briefly shows a check confirmation; failures stay silent. The same opaque plugin entry keeps Markdown-derived Outline aligned, supports Unicode NFKC slugs, an optional caller-owned namespace and safe permalink URL base, and leaves default Markdown plus custom heading renderers unchanged.

@cixzhang @vjeux
