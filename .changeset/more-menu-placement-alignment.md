---
'@astryxdesign/core': patch
---

[fix] MoreMenu forwards `placement` and `alignment` to its DropdownMenu. Both were part of the underlying menu's API but were dropped on the floor by the wrapper, so an overflow menu — the one component whose job is a trailing-edge affordance — could not ask to be end-aligned; it only looked right when the layer happened to collision-flip. Defaults are unchanged: MoreMenu passes the props straight through, so DropdownMenu's `'below'` / `'start'` still apply. (#4952)

@cixzhang
