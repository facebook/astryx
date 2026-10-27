---
'@astryxdesign/core': patch
---

[fix] SideNavHeading: with `headingHref` as its only link, `headerEndContent` now renders beside the heading link instead of inside it. A button placed there was nested in the link, so pressing it also followed the link. The link's accessible name no longer includes the end content.

@cixzhang
