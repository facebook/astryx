---
'@astryxdesign/core': patch
---

[fix] Timestamp: keep relative time within its own tier

Relative-time tiers guarded the raw diff with `<` but displayed the count with `Math.round`, so just under a boundary it rendered "60 minutes ago" / "24 hours ago" instead of "1 hour ago" / "1 day ago" (and the same in the future direction). Floor the per-tier count so it can never reach the next tier.
@raphaelroshanM
