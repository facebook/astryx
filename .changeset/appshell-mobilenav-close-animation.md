---
'@astryxdesign/core': patch
---

[fix] AppShell: defer hiding the mobile nav's Activity boundary until its close animation finishes (#5701)

`AppShell` mounts the mobile nav drawer inside a `React.Activity` boundary that flipped to `mode="hidden"` in the same commit as the drawer closing. React's `Activity` hides its subtree with `display: none !important` synchronously and re-runs the cleanup of every effect inside it, which cut off `MobileNav`'s own slide-out CSS transition and cancelled its delayed `dialog.close()` before either could run. The drawer still closed correctly (a safety-net effect force-closed the native dialog on that same cleanup), just with the close animation skipped entirely.

`AppShell` now holds the `Activity` boundary visible for a beat after the drawer closes, strictly longer than `MobileNav`'s own worst-case close delay, so `MobileNav`'s normal close effect gets a real chance to run its transition and its own timed `dialog.close()` before `Activity` ever hides the subtree.

@HelloOjasMutreja
