---
'@astryxdesign/cli': patch
---

[fix] The upgrade codemod no longer collapses significant JSX whitespace when it renames an element tag. Renaming `<OldName>` next to text and a `{expression}` (e.g. `hello {name} world`) previously dropped the adjacent space (`hello {name}world`); element-tag renames are now spliced into the output so the surrounding JSX is left untouched.

@ejhammond
