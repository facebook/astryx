---
'@astryxdesign/cli': patch
---

[fix] `search()` from `@astryxdesign/cli/api` is now declared to return `SearchResponse`, as its docs say, so TypeScript sees each result's `SearchResultEntry` fields instead of a bare `object`.

@josephfarina
