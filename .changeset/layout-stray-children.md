---
'@astryxdesign/core': patch
---

[fix] `Layout` no longer silently renders a blank page when given JSX children
instead of slot props. `Layout` is slot-driven (`content`/`header`/`start`/
`end`/`footer`), but `<Layout><LayoutContent /></Layout>` previously type-checked
and built green while dropping the children at runtime — leaving an empty shell.
Children are now a compile error (`children?: never`), and as a runtime safety
net any stray children are routed into the `content` slot with a dev warning, so
the mistake degrades to a visible, explained result instead of a blank screen.
@josephfarina
