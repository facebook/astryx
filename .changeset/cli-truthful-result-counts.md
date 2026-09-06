---
'@astryxdesign/cli': patch
---

[fix] CLI: `search` and `build` now report how many results MATCHED, not how many were returned.

@cixzhang

`matchCount` on a `build.kit` envelope, and `output.resultCount` on a recorded run, were both the length of the list after `--limit` had cut it. A query matching two hundred things and one matching exactly twenty filed the same number, so nothing downstream could tell a capped answer from a complete one — and a thin kit read as "the package has nothing" when it was really "the cap hid the rest".

`search --json` now carries `matchCount` alongside `results`, and the text view says `Results for "x" (2 of 57)` when the list was cut short. The payloads themselves are unchanged: `results` is still bounded by `--limit`, and the kit still surfaces at most 3 pages, 5 blocks, and 6 components.
