---
'@astryxdesign/core': patch
---

[feat] SideNavItem: new `actions` slot for row-level secondary controls (icon buttons, menus). Content renders as a sibling of the primary link/button — after the expand/collapse toggle, before nested children in DOM and focus order — so interactive controls never nest inside the primary element and every row control is reachable before focus enters the subtree. Passive content (badges, counts) stays in `endContent`; `actions` is hidden while the rail is collapsed, and stays interactive on disabled items since each supplied control owns its own disabled state. An actions row draws its focus ring as a full-row pill for the primary link or button, while the expand/collapse toggle and each supplied action keep their own — adds `focusOutlineProps.focusWithinFirstChild` and `focusOutlineProps.suppressed` for that pairing. Supplied controls inherit the row's control size through `SizeContext`, the way `SideNav` already cascades one size to its footer icons, so an unsized icon button comes out the same box as the built-in toggle; an explicit `size` still wins. (#4988)

@AKnassa
