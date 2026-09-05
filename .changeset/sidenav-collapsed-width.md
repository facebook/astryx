---
'@astryxdesign/core': patch
---

[feat] SideNav: collapse to a custom width (including zero), with an optional animation (#2331)

`collapsible` gains two keys. `collapsedWidth` sets the collapsed width in pixels: it still defaults to the 48px icon rail, and `0` hides the nav entirely, which is what focused single-pane UIs (chat, editors) want but the rail could not express. Pair `0` with a `SideNavCollapseButton` rendered outside the nav, since the built-in one hides with it. `isAnimated` slides the content out and back in when collapsing to `collapsedWidth: 0`, on the existing `--duration-fast` / `--ease-standard` tokens that `SideNavCollapseButton` already animates its chevron with, so no new tokens are introduced.

The animation follows the motion convention: only `transform` animates. The content slides as one slab inside the nav's overflow clip (mirroring `MobileNav`'s drawer, RTL included), while the box itself never tweens. It holds its expanded width for exactly the slide through a width transition on a `step-end` curve, which computes no intermediate width, then reclaims the space in a single reflow; expanding snaps the box open immediately and slides the content back in. The icon rail always snaps, because animating it would mean animating `width`, so `isAnimated` with any other `collapsedWidth` warns in development. The animation honours `prefers-reduced-motion`.

A nav collapsed to zero width is invisible but still in the DOM, so its links would keep taking keyboard focus and stay in the accessibility tree. A fully hidden nav is therefore also marked `inert`. If focus is _inside_ the nav when the collapse starts, it is first parked before `inert` lands on the outside `SideNavCollapseButton` that shares the nav's collapse state (the same `onCollapsedChange`, or the same `handleRef`), so a page with two navs never lands focus on the wrong toggle; with no such button, focus is released with a dev warning. A resizable nav also keeps its resize wrapper while collapsed, so collapsing no longer remounts the nav and drops whatever focus was inside it. The icon rail is _visible_, so it stays interactive; the existing behavior is unchanged.

Defaults are untouched: without `collapsedWidth` the nav still collapses to the icon rail, and without `isAnimated` it still snaps.

@AKnassa
