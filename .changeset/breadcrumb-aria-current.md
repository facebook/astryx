---
'@astryxdesign/core': patch
---

[fix] Breadcrumbs: auto-detected current breadcrumb now places `aria-current="page"` on the item's content element (link/button/span), matching the explicit `isCurrent` path, instead of on the outer `<li>`. When the last breadcrumb is a link, the anchor itself now carries `aria-current` so screen readers announce it as the current page (#3343).
@cixzhang
