---
'@astryxdesign/cli': patch
---

[fix] A section read on a docs-tree namespace answers from the guide that has the section again, so `astryx docs layout side-panels` and the other layout section reads released in 0.6.6 work after the layout split. `docs(route, section)` returns the same `docs.detail.section` the guide's own section read returns, found by key, then by title, in `--dense` and `--zh` too. When no guide or more than one has the section, the read fails with `ERR_UNKNOWN_SECTION` and names the guides to read it from.

@josephfarina
