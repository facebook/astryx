---
'@astryxdesign/core': patch
---

[fix] Icons render through `<Icon>` and carry their component's theme target (#4838).

Styling-only wrappers around rotating icons are gone, and each rotation now sits on the icon element that already carries the component's theme target — so a theme reaches the glyph and its open/closed transform through one selector. No new theme targets: Selector, MultiSelector and ComplexSelector consolidate onto their existing `*-indicator-icon` targets, and the Table plugins and TreeList simply shed redundant wrapper elements.

Where an RTL mirror sat on a separate parent element, it is folded into each state's transform (`scaleX(-1) rotate(...)`) so one element carries both. In the Table plugins that mirror was inert — `transform` does not apply to a non-replaced inline box — so RTL disclosure chevrons now mirror correctly where they silently did not before.

Registry glyphs in SideNav, TopNav, Collapsible, TreeList and Breadcrumbs now render through `<Icon>` instead of `useIcon()` inside a hand-written `<span>`. Those spans were a weaker reimplementation of `<Icon>`, which already resolves the same glyph and renders a span carrying merged `className`/`style`/`xstyle` plus the `astryx-icon` theme target. The converted sites gain that target, and the node count is unchanged. `useIcon()` keeps its place for the cases that resolve a glyph _without_ rendering it: MoreMenu and ChatSendButton pass the node as a default for a consumer-overridable prop, which `<Icon>` cannot express.

Also adds the `@astryx/no-wrapper-transform` lint rule (warn) for `<div>`/`<span>` wrappers that exist to transform the icon inside them.

@cixzhang
