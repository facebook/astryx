---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[fix] A Properties preview that renders nothing now says why instead of showing a blank stage.

`MobileNavToggle` reads AppShell mobile context and returns `null` above the mobile breakpoint, so its Properties stage was empty on load at desktop widths and looked like a broken component. Three other components were empty for their own reasons — `CheckIndicator` (`unchecked` draws nothing, and it is the first enum option the playground picks), `ChatMessageMetadata` (every prop optional), and `SideNavCollapseButton` (hides itself when collapse is unavailable).

The preview stage now detects an empty render and shows a short note in place of the blank box, carrying `playground.emptyNote` when the doc supplies one. `CheckIndicator` and `ChatMessageMetadata` get playground defaults instead, so they render for real.

@cixzhang
