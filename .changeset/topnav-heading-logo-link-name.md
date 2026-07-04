---
'@astryxdesign/core': patch
---

[fix] TopNavHeading: give the logo an accessible name when it links to a destination. The logo image is decorative, so a logo wrapped in `headingHref` produced an unnamed link (axe: link-name). It is now labelled from `heading` (or a new optional `logoLabel` prop for logo-only headings). (#3343)

@cixzhang
