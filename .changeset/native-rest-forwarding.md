---
'@astryxdesign/core': patch
---

[fix] Forward unhandled pass-through attributes (`data-testid`, `aria-*`, `id`, etc.) to the primary rendered element of Switch, Pagination, RadioListItem, SideNavSection, TableHeader/TableBody/TableFooter, and TopNavMegaMenuFeaturedCard. These components previously dropped attributes not explicitly consumed, so test hooks and accessibility attributes silently disappeared.

@cixzhang
