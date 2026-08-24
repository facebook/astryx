---
'@astryxdesign/cli': patch
---

[fix] Table - Grouped page template: wrap the rows in `TableBody`

The template rendered `<TableRow>` straight into `<Table>`, so the emitted DOM
was `<table><tr>`. `<table>` cannot contain a row directly: the HTML parser
inserts an implied `<tbody>` when it parses server-rendered markup and React
does not when it renders on the client, so anyone who copied the template into
an app as a server-rendered page inherited a hydration mismatch in their own
app. Client-only the DOM is still invalid — nothing reparents the rows, so the
table ends up with `<tr>` children and no `<tbody>` at all, and any CSS or
query aimed at `tbody` silently misses.

The rows now sit in `<TableBody>`, the same element the data-driven `data={...}`
path renders, so styling, dividers, and column widths are unchanged (#5278).

@AKnassa @rubyycheung
