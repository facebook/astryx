---
'@astryxdesign/core': patch
---

[fix] Omit `aria-controls` from a closed Selector until its lazy listbox is mounted,
preventing an invalid ARIA reference on initial render while preserving the
combobox relationship whenever the popup is expanded.

@light-merlin-dark
