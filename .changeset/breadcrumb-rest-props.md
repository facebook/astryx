---
'@astryxdesign/core': patch
---

[fix] Breadcrumbs: BreadcrumbItem now forwards remaining BaseProps (id, aria-_, role, event handlers, data-_) to the underlying `<li>` element. Previously these props were accepted by TypeScript but silently dropped at runtime.
@cixzhang
