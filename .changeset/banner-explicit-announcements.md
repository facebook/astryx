---
'@astryxdesign/core': minor
---

[breaking] Stop deriving live-region roles from `Banner.status`. Banners are non-live by default; call `useAnnounce` from the actual async transition handler, or provide an explicit `role="status"` for a persistent semantic mirror.

`role="alert"` is now opt-in rather than automatic for warning and error banners.

@cixzhang
