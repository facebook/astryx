---
'@astryxdesign/core': patch
---

[fix] Remove styling-only wrappers around rotating icons, and put each rotation on the icon element that already carries the component's theme target — so a theme reaches the glyph and its open/closed transform through one selector.

No new theme targets: Selector, MultiSelector and ComplexSelector consolidate onto their existing `*-indicator-icon` targets, and the Table plugins and TreeList simply shed redundant wrapper elements.

Where an RTL mirror sat on a separate parent element, it is folded into each state's transform (`scaleX(-1) rotate(...)`) so one element carries both. In the Table plugins that mirror was inert — `transform` does not apply to a non-replaced inline box — so RTL disclosure chevrons now mirror correctly where they silently did not before.

Also adds the `@astryx/no-wrapper-transform` lint rule (warn) for `<div>`/`<span>` wrappers that exist to transform the icon inside them.

@cixzhang
