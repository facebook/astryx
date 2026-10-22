---
'@astryxdesign/cli': patch
---

[fix] Discover results name their source package and tolerate typos.

@josephfarina

Every `discover` JSON result now names its package per the provenance rule:
single-artifact responses (`discover.detail`, `discover.detail.doc`,
`discover.item`) carry `package` in the envelope, and list entries
(`discover.list`, and each entry of its `meta.available`) carry `package`. Text output matches: an opened doc prints its `package:` line on stdout.

`discover <words>` now has the same typo tolerance as `search`: a near-miss
name (edit distance 1–3, with minimum-length guards) returns results instead
of "not found". Previously `discover Geodetics` said "not found" while
`search Geodetics` found `geodesic`.
