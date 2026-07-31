---
'@astryxdesign/core': patch
---

[fix] Complete the RTL physical→logical CSS migration across the core package: the final components (Avatar, Banner, Calendar, Chat composer, Chat composer drawer, Markdown, Popover, Slider, Resizable) now use CSS logical properties (`insetInlineStart/End`, `borderStart*/End*` radii, `textAlign: 'end'`) instead of physical `left`/`right`, so they mirror correctly under RTL. The Avatar status dot's outward-push `transform` is now direction-aware, so it hugs the bottom-inline-end corner (bottom-right in LTR, bottom-left in RTL) instead of pulling inward under RTL.

The Popover close button, vertical Slider track/thumb, and ResizeHandle centered grab-zone/pill now consume the shared `rtlStyles.centerInline` helper — fixing an RTL regression where a logical `insetInlineStart: 50%` anchor combined with a physical centering `translate` shifted the element off-center by its own width.

Dialog's `position` prop is intentionally left physical: it exposes physical `left`/`right` as consumer-facing API, so its logical migration is handled separately via a deprecation path in its own PR. LTR rendering is pixel-identical.
@nynexman4464
