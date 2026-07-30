---
'@astryxdesign/core': patch
---

[fix] Complete the RTL physical→logical CSS migration across the core package: the final components (Avatar, Banner, Calendar, Chat composer, Chat composer drawer, Dialog, FieldStatus, Markdown, Popover) now use CSS logical properties (insetInlineStart/End, borderStart*/End* radii, textAlign: end) instead of physical left/right, so they mirror correctly under RTL. With the migration finished, the `@astryx/no-physical-properties` lint rule is promoted from `warn` to `error` in both the recommended and strict tiers to gate against future regressions. LTR rendering is pixel-identical.
@nynexman4464
