---
'@astryxdesign/core': patch
---

[chore] Remove 15 `<div>`/`<span>` wrappers that existed only to style the single Astryx component inside them (Carousel, Lightbox, MobileNav, Pagination, Switch, TopNav, TopNavMegaMenu, Table row-expansion menu icon); the styles now sit on that component's own root via `xstyle` — or, for Pagination's page-size Selector, its documented `width` prop. No API change, but the rendered DOM has one fewer node at each site, so anything selecting on that structure is affected: `patch`, not `[breaking]`, because the removed nodes were internal implementation with no documented contract, no theme target, and no stable class. Two rendering defects the wrappers were causing are fixed as a side effect: the Lightbox prev/next chevrons and the Pagination first/last chevrons were 2.5-3px off their button's vertical centre. (#4775)

@cixzhang
