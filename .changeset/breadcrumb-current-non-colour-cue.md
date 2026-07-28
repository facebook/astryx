---
'@astryxdesign/core': patch
---

[fix] BreadcrumbItem: give the current page a heavier label weight so it is tellable from the navigable crumbs without relying on colour (WCAG 2.1 A 1.4.1). `current` previously pinned `fontWeight: 'inherit'`, leaving colour as the only signal — and in the `supporting` variant links and the current crumb resolve to the same `--color-text-secondary`, so there was no signal at all. The cue applies to an explicit `isCurrent` item, an auto-detected last item, and a current crumb that is also a menu trigger. Navigable crumbs are unchanged.

@AKnassa
