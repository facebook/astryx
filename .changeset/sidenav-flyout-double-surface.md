---
'@astryxdesign/core': patch
---

[fix] `SideNavItem`'s collapsed submenu flyout no longer draws a second panel inside the popover. `usePopover` already paints the surface it renders into — background, `--radius-container` corner, `--shadow-low` — and the flyout's content added a 1px `--color-border` rectangle at radius 0 on top of it, so the menu showed square grey corners inside rounded ones. The same element carried `marginInlineStart`, which inside the panel is not a gap from the rail but a 4px strip down the flyout's inside edge with the painted panel poking out behind it. The gap moves to the positioned layer, where `DropdownMenu` puts it, and becomes a real 4px between the trigger and the flyout; the menu content lands on the same pixel column it did before.

@cixzhang
