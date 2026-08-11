---
'@astryxdesign/core': patch
---

[fix] Render registry glyphs through `<Icon>` instead of `useIcon()` inside a hand-written `<span>`, in SideNav, TopNav, Collapsible, TreeList and Breadcrumbs.

Those spans were a weaker reimplementation of `<Icon>`, which already resolves the same glyph and renders a span carrying merged `className`/`style`/`xstyle` plus the `astryx-icon` theme target. The converted sites gain that target — no new targets are introduced — and the node count is unchanged.

`useIcon()` keeps its place for the cases that resolve a glyph *without* rendering it: MoreMenu and ChatSendButton pass the node as a default for a consumer-overridable prop, which `<Icon>` cannot express.

@cixzhang
