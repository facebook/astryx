---
'@astryxdesign/cli': patch
---

[fix] `search` no longer lets the components a page template happens to render outrank the page a query is actually about. A page's keywords are read back out of its own source, and each one scored as an exact keyword match — the same 90 an author's `category` earns — so every page rendering a `<List>` anywhere claimed "list" as loudly as the page that is a list. On `customer list` all 14 of them tied at 98, the tie fell through to the alphabetical tiebreak, and `table-page` came back 35th of 36. Breadth was unbounded too: `theme-showcase` renders 51 components, four times the median page, so it matched more terms of almost any query than the page written for it, and took first place on `list of users`.

Keywords now come in two grades. Authored ones — a component's `keywords`, a block's `componentsUsed`, a page's `category` — keep scoring at face value. Ones derived by reading a page's source are length-normalized by how many were derived alongside them, so a focused page outranks a kitchen sink on the same component, and a wide-surface page stops claiming concepts it only brushes against. `customer list` now answers with the table pages, and results say `renders "List"` rather than `keyword "List"` so a ranking can be read back.

@AKnassa
