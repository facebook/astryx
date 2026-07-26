---
'@astryxdesign/core': patch
---

[fix] Banner: a status added by augmenting `BannerStatusMap` no longer loses its ARIA role. The status→role and status→icon tables covered only the four built-in statuses, so an augmented status resolved to `undefined` — the banner rendered with no live-region role at all (a silent accessibility regression TypeScript could not catch), and the default icon threw on an undefined name. Both tables are now `Partial` and both reads fall back: `role="status"` and the `info` icon. (#4276)
@AKnassa
