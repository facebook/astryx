---
'@astryxdesign/core': patch
---

[feat] SideNav: collapse to a custom width (including zero), with an optional animation (#2331)

`collapsible` gains two keys. `collapsedWidth` sets the collapsed width in pixels — it still defaults to the 48px icon rail, and `0` hides the nav entirely, which is what focused single-pane UIs (chat, editors) want but the rail could not express. `isAnimated` animates the width change, using the existing `--duration-fast` / `--ease-standard` tokens that `SideNavCollapseButton` already animates its chevron with, so no new tokens are introduced.

A nav collapsed to zero width is invisible but still in the DOM, so its links would keep taking keyboard focus and stay in the accessibility tree. A fully hidden nav is therefore also marked `inert`. The icon rail is _visible_, so it stays interactive — the existing behavior is unchanged.

Defaults are untouched: without `collapsedWidth` the nav still collapses to the icon rail, and without `isAnimated` it still snaps. The animation also honours `prefers-reduced-motion`.

@AKnassa
