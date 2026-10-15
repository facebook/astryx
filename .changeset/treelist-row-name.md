---
'@astryxdesign/core': patch
---

[fix] `TreeList`: each row is now named by its label alone and described by its description (`aria-labelledby`/`aria-describedby` on the `treeitem`), so screen readers no longer read the chevron toggle's label or the description as part of a row's name, and link and action rows are named as rows, not only through their inner control. Typeahead matches the label rather than the row's whole text.

@cixzhang
