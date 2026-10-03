---
'@astryxdesign/core': patch
---

[feat] `MultiSelector` can offer a `Create "<query>"` row for a search that matches nothing.

With `hasSearch`, the new `hasCreate` + `onCreate` props put a
`Create "<query>"` row first in the list when the trimmed query matches no
option label exactly (case-insensitive — `Tokenizer.hasCreate`'s rule).
Picking it, or Enter with nothing highlighted, calls `onCreate` with the
trimmed query (not `onChange`), clears the search so the option the caller
adds is visible, and announces the creation; the live region announces the row
instead of "No results found" when it is the only result. Without `onCreate` no
row is offered. Off by default; existing selectors are unchanged.

@vjeux
