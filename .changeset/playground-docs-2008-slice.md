---
'@astryxdesign/core': patch
---

[docs] Add playground defaults to Section, FormLayout, Breadcrumbs, List, RadioList, CheckboxList, and DropdownMenu doc files — plus standalone defaults for their BreadcrumbItem/ListItem/CheckboxListItem/DropdownMenuItem sub-components so the docsite's playground inheritance doesn't leak multi-item state onto item pages — and sync the `startIcon` slot descriptor on the inline BreadcrumbItem entry. A scoped slice of #2008. Document Slider's `width` and Toolbar's `dividers` props (both had playground defaults referencing undocumented props), and add a doc-file scanner test that checks every `playground.defaults` key against the component's documented props (including compound docs whose props live on components[] entries) and resolves every `__element` descriptor name against the package exports.

@AKnassa
