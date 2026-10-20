---
'@astryxdesign/cli': patch
'@astryxdesign/core': patch
---

[fix] `astryx search` ranks a match on more of your words above a shorter named entry, and drops two keywords that pulled entries above better answers.

@josephfarina

- A match on part of a longer name that reads more of the query than the entry the query names is no longer held below it: `dropdown menu radio options` leads with `DropdownMenuRadioItem`, not `DropdownMenu`.
- `Icon` drops the `thumbsup` keyword and `useResizable` drops `splitview`.
