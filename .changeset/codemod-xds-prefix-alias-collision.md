---
'@astryxdesign/cli': patch
---

[fix] The XDS-prefix codemod no longer produces a file that will not compile. Dropping the prefix renames `XDSButton` to `Button`, but if the file already had a local binding called `Button` the rewrite collided with it and shadowed one of the two. The import is now aliased instead, so both survive and the file still typechecks (#5225).

@ejhammond
