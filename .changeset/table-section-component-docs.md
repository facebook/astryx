---
'@astryxdesign/core': patch
---

[docs] Table: document the section components children mode requires

Children mode stopped wrapping children in a `<tbody>` in #2098, but the docs
still described the contract from before it. The `children` prop read "render
TableRow/TableCell directly"; `TableRow`'s own `@example` showed a row sitting
in `<Table>` with no section around it; and `TableHeader`, `TableBody`, and
`TableFooter` — public exports since that change — had no docs at all and were
missing from `Table`'s component list. A reader following the component's own
documentation wrote `<table><tr>`, which is invalid HTML and mismatches on
hydration.

The three section components are now documented, listed on `Table`, and named
in the `children` prop description, in a best practice, and in `TableRow`'s
example (#5278).

@AKnassa @rubyycheung
