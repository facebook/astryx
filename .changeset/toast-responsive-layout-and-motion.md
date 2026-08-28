---
'@astryxdesign/core': patch
---

[fix] Toast fits narrow and safe-area viewports, aligns wrapped actions and dismissal, uses edge-directed entrance and exit motion, exposes the Notifications landmark only while populated, and keeps exactly the viewport gutter below the final toast (#5353, #5460)

Inter-toast spacing is 8px, while the visual bottom no longer adds a trailing toast gap on top of viewport padding. Placement, visible-stack limits, auto-hide defaults, announcement semantics, and dismissal reasons are unchanged.

@rubyycheung @cixzhang
