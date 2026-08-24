---
'@astryxdesign/core': patch
---

[fix] Table: a plugin can suppress a body cell's content, and grouped rows use it to keep synthetic group headers out of your cell renderers (#5363)

`useTableGroupedRows` injects section-header rows into the flattened data, and
`BaseTable` evaluates every column's `renderCell` against every row. A renderer
that keys a lookup off a field — `STATUS_META[item.status].dot` — was therefore
handed a row that is not yours and threw, blanking the page the moment grouping
was switched on. The header Proxy answering unknown fields with `''` only ever
rescued a renderer that _prints_ a field; `''` fails a lookup exactly as
`undefined` does.

`BodyCellRenderProps` gains `isContentSuppressed?: boolean`. A plugin sets it in
`transformBodyCell` for a row whose cells it is about to replace wholesale in
`transformBodyRow`, and the table renders that cell empty without calling the
column's renderer or the default one. It is decided per cell at render time
against the final column list, so it also covers columns other plugins
contributed — whatever order the plugins were listed in.

@ernestt
