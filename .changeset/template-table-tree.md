---
'@astryxdesign/cli': patch
---

[feat] Add the Tree Table page template

A hierarchical table where every parent row is derived from its children,
shown as a code repository: folders roll up the newest commit beneath them,
columns resize, sorting is scoped to siblings so branches never interleave,
arrow keys walk the tree per the APG treegrid pattern, and search prunes to
the branches that match. Selecting a folder drives a header trail that folds
its middle into a menu once the path outgrows the bar. Supporting repository
chrome — header actions, an About sidebar and a README rendered with
`Markdown` — puts the table in the context that makes its rollups legible.

@ernestt
