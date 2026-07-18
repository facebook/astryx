---
'@astryxdesign/core': patch
---

[docs] Add playground defaults to Section, FormLayout, Breadcrumbs, List, RadioList, CheckboxList, and DropdownMenu doc files, plus a `startIcon` slot descriptor on BreadcrumbItem — a scoped slice of #2008. Document Slider's existing `width` prop (its playground default referenced an undocumented prop), and add a doc-file scanner test that checks every `playground.defaults` key against the component's documented props and resolves every `__element` descriptor name against the package exports.

@AKnassa
