---
'@astryxdesign/core': patch
---

[fix] Typeahead: ignore stale async search responses that resolve after a newer query (#3587)

Each search now claims a fresh generation before awaiting its source. The existing stale-response guard can then discard slower results from abandoned queries instead of replacing the current list and highlight.

@ahfoysal
