---
'@astryxdesign/core': patch
---

[fix] SideNavHeading: label the product icon link with the heading text so it has an accessible name. When superheadingHref, headingHref, and a menu were all set, the icon link to the heading href rendered with no text or aria-label, so axe flagged it under link-name and screen readers announced an unlabeled link. (#3343)

@cixzhang
