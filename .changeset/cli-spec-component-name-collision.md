---
'@astryxdesign/cli': patch
---

[fix] `astryx integration add component <Name>` now refuses with `ERR_FILE_EXISTS` when a component doc anywhere under the components root already uses that name, for example `components/<Name>/<Name>.doc.mjs`. Before, it wrote a second `<Name>` beside the first and reported success, and `astryx component <Name>` then showed the new scaffold instead of the authored component. `--dry-run` refuses the same way. (#6557)

@josephfarina
