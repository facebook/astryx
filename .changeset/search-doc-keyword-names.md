---
'@astryxdesign/cli': patch
---

[fix] `astryx search` keeps a guide first when the query is a phrase the guide declares as a keyword. A guide that declares `code review` now comes before the Code component for that search, instead of below every component that matches one word. A component whose name is the whole query still comes first, and one-word queries are unchanged.

@josephfarina
