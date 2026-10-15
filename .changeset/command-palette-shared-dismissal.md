---
'@astryxdesign/core': patch
---

[fix] Keep CommandPalette dismissal, text entry, result focus, and empty-state accessibility aligned with shared contracts. Two accessibility behaviors change (AST-017 FR53; WCAG 2.2 4.1.2 Name, Role, Value):

- The query field's default accessible name was its placeholder (`Search…`, or the caller's `placeholder`); it is now `Search commands`, translated. Pass `label` to keep a specific name, for example `label="Search…"` for the old default. A caller whose custom `placeholder` served as the name keeps working code and hears the generic name until it passes `label`.
- While no selectable result exists, the results container no longer exposes an empty `listbox`, and the query field reports `aria-expanded="false"` with no `aria-controls` or `aria-activedescendant`. It was an expanded combobox controlling an empty listbox.

@cixzhang
