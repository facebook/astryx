---
'@astryxdesign/core': patch
---

[docs] Add playground defaults to the Section, FormLayout, Breadcrumbs, List, RadioList, and CheckboxList doc files, plus standalone defaults for their BreadcrumbItem, ListItem, and CheckboxListItem sub-components so the docsite's playground inheritance doesn't leak multi-item state onto item pages, and add `startIcon` slot elements to the inline BreadcrumbItem entry. A scoped slice of #2008. Also add the zh and dense descriptions for Slider's `width` and Toolbar's `dividers` props, and a doc-file scanner test that checks every `playground.defaults` key against the component's documented props (including compound docs whose props live on components[] entries) and resolves every `__element` descriptor name against the package exports.

@AKnassa
