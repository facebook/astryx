---
'@astryxdesign/cli': patch
---

[fix] `astryx search` (and `astryx build`, which shares its ranking) never surfaced a component whose exact multi-word keyword phrase was searched, if enough other unrelated candidates happened to each contain one of the query's individual words. Searching `"table of contents"` returned no results for `Outline`, even though `Outline.doc.mjs` declares `'table of contents'` verbatim as a keyword, because `Table`-related templates each matched `table` and `contents` separately and their combined per-word score outranked Outline's single exact match.

A query that exactly matches a candidate's declared keyword (or name) verbatim is now promoted to a top-tier score, so it always outranks a candidate that only coincidentally contains several of the query's individual words. Single-word queries and queries that don't exactly match a keyword are unaffected.

@nynexman4464
