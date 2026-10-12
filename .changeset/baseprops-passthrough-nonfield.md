---
'@astryxdesign/core': minor
---

[breaking] Layout, MetadataList, NavHeadingMenuItem and TopNavMegaMenuItem now apply the BaseProps they accept (id, role, aria-\*, data-\*, hidden, inert, dir, event handlers; TopNavMegaMenuItem also xstyle/className/style) instead of silently dropping them; NavHeadingMenu keeps arrow navigation when an item handler cancels. (#7331)

Migration: remove any of those props you passed that you relied on being ignored; a TopNavMegaMenuItem styled through xstyle/className/style now shows that styling.

From #5656 by @harjothkhara.

@harjothkhara
