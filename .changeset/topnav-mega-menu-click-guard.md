---
'@astryxdesign/core': patch
---

[fix] TopNavMegaMenu: fix the hover-then-click flicker where clicking a nav item after hovering dismissed the mega menu. The trigger is registered as the native invoker for its `popover="auto"` panel and uses a Vercel-style hover→click guard, so the click that naturally follows a hover confirms and pins the panel open instead of toggling it shut. Native outside-click, Escape dismissal, and sibling-popover exclusivity are preserved. Click/keyboard opens are pinned (persist past mouse-leave); hover opens stay transient. Keyboard activation (Enter/Space) always opens and moves focus into the panel, while touch/click without a preceding hover toggles cleanly (#3121)
@imdreamrunner
