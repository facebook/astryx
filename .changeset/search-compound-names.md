---
'@astryxdesign/cli': patch
'@astryxdesign/core': patch
---

[fix] `astryx search` finds more of what a reader means when the words differ from the catalog's.

@josephfarina

- Adjacent query words that join into a component, hook, or template name, or into a one-word keyword, match it: `table header cell with sort arrow` finds `TableHeaderCell`, `tree view folders` the `treeview` keyword, and a hook answers to its words without `use`. Most of a name, a name's leading words, or a run of its words also count for components and hooks, a step below the full name.
- A query that is one camelCase identifier and matches nothing as typed is read as the words it spells, so an unknown API name such as `useTablePaginationState` reaches `useTablePagination`. In a query of several words each identifier stays one term.
- When the whole query is an entry's name, these readings add no near siblings beside it. A match on a joined keyword never ranks above an entry the query names, and a match on part of another name does only when it spans more query words than that entry's name.
- A gerund matches its verb (`spacing` and `space`, `dragging` and `drag`), and a plural can start a longer word through its singular (`tokens` and `Tokenizer`).
- Core component docs declare more keywords: other libraries' names (`scrollarea`, `togglegroup`, `pageheader`, `splitpane`, `circularprogress`, `linearprogress`, `commandmenu`, `relativetime`, `sidesheet`, `descriptionlist`, `inlinecode`) and common glyph names on `Icon`, since any icon library's glyph renders through it.
- The JSON shape is unchanged.
