---
'@astryxdesign/core': patch
---

[fix] Keep CommandPalette dismissal, text entry, result focus, and empty-state accessibility aligned with shared contracts. These accessibility behaviors change (AST-017 FR53; WCAG 2.2 2.1.1 Keyboard and 4.1.2 Name, Role, Value):

- While no selectable result exists, the results container no longer exposes an empty `listbox`, and the query field reports `aria-expanded="false"` with no `aria-controls` or `aria-activedescendant`. It was an expanded combobox controlling an empty listbox.
- Home and End move the caret in the query field, as in any text field; they used to jump to the first and last result. Page Up and Page Down still jump to the first and last result.
- A search with no results announces the empty message the palette renders (`No results` by default, or the caller's `emptySearchText`), once the search settles. It used to announce `No results for <query>`, whatever the palette showed. An override of the `@astryx.commandPalette.noResultsFor` catalog entry no longer has any effect; use `emptySearchText` to customize the message.

@cixzhang
