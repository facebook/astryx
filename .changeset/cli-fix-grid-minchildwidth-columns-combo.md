---
'@astryxdesign/cli': patch
---

[fix] The `migrate-grid-minchildwidth-to-columns` codemod bailed without changes when a `<Grid>` had both `columns` and `minChildWidth`, leaving the now-invalid `minChildWidth` prop in place and failing type-checking on 0.3.0.

When `columns` is a numeric literal, it now migrates losslessly to the 0.3.0 object form. This mirrors the old (0.2.0) Grid runtime, where `minChildWidth` dominated and the numeric `columns` capped the column count under `auto-fit`: `<Grid columns={3} minChildWidth={280}>` becomes `<Grid columns={{minWidth: 280, max: 3, repeat: 'fit'}}>`. Object or dynamic `columns` values remain a deliberate bail.

@ejhammond
