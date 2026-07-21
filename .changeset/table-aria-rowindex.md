---
'@astryxdesign/core': patch
---

[feat] Table: `rowIndexStart` and `rowCount` props expose row numbering as a table-level ARIA concern, so `aria-rowindex`/`aria-rowcount` reflect a row's position in the full dataset — correct across pagination and even when no visible index column is rendered. Opt-in; tables that set neither prop are unchanged. Closes #3939.
@humbertovirtudes
