---
'@astryxdesign/core': patch
---

[fix] Drop the shared trigger-icon wrapper in Selector, MultiSelector and ComplexSelector — each trigger icon is now the element that carries its own box, colour and theme target. (#4846)

The wrapper set a 16px box and `--color-icon-secondary` on a span with no theme target of its own, shared by two different affordances: the status glyph and the disclosure chevron. `<Icon>` already provides both (`size="sm"` is the same 16px box, `color="secondary"` the same token), so the wrapper only stood between a theme and the icons — and made the two affordances share a node they never should have shared.

@cixzhang
