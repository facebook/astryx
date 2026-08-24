---
'@astryxdesign/core': patch
---

[fix] `Selector` and `MultiSelector` no longer expose their `{type: 'divider'}` separators to assistive technology. `role="listbox"` only permits `option`/`group` children, but the divider previously rendered `role="separator"` as a direct child of the listbox (axe `aria-required-children`, impact critical). The divider is decorative and carries no information the options don't, so it's now hidden from the accessibility tree via `aria-hidden`, matching the pattern already used for section headings.

@HelloOjasMutreja
