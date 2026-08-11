---
'@astryxdesign/core': patch
---

[fix] The SideNav footer icon row comes out one size, and the collapse chevron is centred. `SideNav` renders its built-in `SideNavCollapseButton` in the same row as whatever the consumer passes to `footerIcons`, but hardcoded `Button`'s default `md` — so a row of `sm` icon buttons shipped with one 32px control among 28px ones. The four icon rows (footer, its collapsed rail form, the topbar strip and the drawer footer) now cascade `sm` through `SizeContext`, the mechanism `Toolbar`, `ButtonGroup` and `InputGroup` already use, so the built-in button and any unsized child resolve to one height; an explicit `size` on a child still wins. `SideNavCollapseButton` also takes a `size` prop of its own, for placements outside the nav (`handleRef` in a `TopNav`) where there is no row to inherit from. Separately, the chevron sat 2.42px above the button's centre: its RTL-mirror wrapper is a flex item of Button's icon slot and blockifies, which gave it a line box and seated the glyph on the text baseline — it is now a flex container, and the glyph centres exactly.

@cixzhang
