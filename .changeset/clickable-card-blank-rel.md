---
'@astryxdesign/core': patch
---

[fix] `ClickableCard` with `href` and `target="_blank"` now gives its link `rel="noopener noreferrer"`, the same rel `Link`, `Item`, and `DropdownMenuItem` add for a new-tab link. Opening the card from the keyboard or the link's context menu no longer sends the referrer or exposes the opener. Same-tab and disabled cards are unchanged.

@cixzhang
