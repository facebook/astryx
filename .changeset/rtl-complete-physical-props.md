---
'@astryxdesign/core': patch
---

[fix] Complete the RTL physical→logical CSS migration across the core package: the final components (Avatar, Banner, Calendar, Chat composer, Chat composer drawer, FieldStatus, Markdown, Popover) now use CSS logical properties (insetInlineStart/End, borderStart*/End* radii, textAlign: end) instead of physical left/right, so they mirror correctly under RTL. (Dialog's `position` prop is intentionally excluded — it exposes physical `left`/`right` as consumer-facing API, so its logical migration is handled separately via a deprecation path in its own PR.) The Avatar status dot's outward-push `transform` is now direction-aware too, so it hugs the bottom-inline-end corner (bottom-right in LTR, bottom-left in RTL) instead of pulling inward under RTL. With the migration finished, the `@astryx/no-physical-properties` lint rule is promoted from `warn` to `error` in both the recommended and strict tiers to gate against future regressions. LTR rendering is pixel-identical.
@nynexman4464
