---
'@astryxdesign/core': patch
---

[feat] `MultiSelector` can offer a `Create "<query>"` row for a search that matches nothing.

With `hasSearch`, the new `hasCreate` switch puts a `Create "<query>"` row
first in the list when the trimmed query equals no option label under the
search's own case-insensitive matching and the options have loaded. Picking it, or Enter
with nothing highlighted, calls `onChange` with the query appended to the value
and a second argument `{type: 'create', query}` (exported as
`MultiSelectorChange`), then clears the search; the caller adds an option for
the new value in that same update. Every other change passes no descriptor, so
existing one-argument handlers are unchanged. `hasCreate` without `hasSearch`
warns in development and offers nothing. Off by default.

@vjeux
