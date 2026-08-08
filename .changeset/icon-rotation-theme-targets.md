---
'@astryxdesign/core': patch
---

[feature] State-driven icon rotations now live on the icon element itself, which carries a stable theme target — so a theme can restyle a disclosure glyph *and* its open/closed transform through one selector.

Previously the rotation sat on a styling wrapper while the theme target (where one existed) sat on the glyph inside it, so the element a theme could reach and the element that actually moved were different nodes. Every rotating chevron across Selector, MultiSelector, ComplexSelector, TreeList, Table (tree / grouped rows / row expansion), SideNav, TopNav, Collapsible, Banner, CodeBlock, TabList and Chat now exposes a `*-icon` target with `data-state`.

Where an RTL mirror previously sat on a separate parent element, it is folded into each state's transform (`scaleX(-1) rotate(...)`) so one element carries both. In the Table plugins that mirror was inert — `transform` does not apply to a non-replaced inline box — so RTL disclosure chevrons now mirror correctly where they silently did not before.

Also adds the `@astryx/no-wrapper-transform` lint rule, which fails a `<div>`/`<span>` that exists to apply a transform to the icon inside it.

@cixzhang
