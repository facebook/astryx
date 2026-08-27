---
'@astryxdesign/cli': patch
---

[feat] New `table-filter` page template: a table page built around a filter token list

Ports the feature set of the internal XDS table page pattern onto Astryx
primitives. The filter row is a token list of quick-filter toggles and field
controls — `Selector`, `MultiSelector`, and a `ComplexSelector` wrapping a
range `Slider` — that swaps to `PowerSearch` for anything the tokens can't
express. Both modes read and write the same `PowerSearchFilter[]`, so a filter
built in either survives the swap. Controls carry field chrome when unset and
a pressed fill once they hold a value, so the row reads as one family whether
a clause came from a toggle or a selector.

Around that: saved views that capture the filters and the whole table
configuration, a bulk-edit bar that slides in on selection, and a view options
popover with four panels — a drag-and-drop column transfer list, density,
sticky edges, and grouping — that apply instantly. Clicking a row opens a
resizable detail panel. The list pages in by infinite scroll against an
`IntersectionObserver`, with skeleton rows aligned to the table's own column
grid standing in for the batch in flight, and empty states for the no-results
and no-data paths. The toolbar wraps to a second row under a container query
rather than a viewport one, so it responds to the width the detail panel
leaves it.

Uses the `Table - Filtering` category, already reserved in the
`TemplateCategory` union.

@ernesttien
