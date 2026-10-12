---
'@astryxdesign/core': minor
---

[breaking] Stop deriving live-region roles from `Banner.status`. Banners are non-live by default; call `useAnnounce` from the actual async transition handler, or provide an explicit `role="status"` for a persistent semantic mirror. (#6630)

`role="alert"` is now opt-in rather than automatic for warning and error banners.

@cixzhang

Old usage:
`Banner` derived `role="status"` or `role="alert"` from its `status` variant.

Replacement:
The caller sets the role explicitly, or announces with `useAnnounce`.

Migration:
Call `useAnnounce` from the actual async transition handler, or provide an explicit `role="status"` for a persistent semantic mirror.

Codemod:
None — the right announcement depends on the callsite.
