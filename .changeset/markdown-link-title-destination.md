---
'@astryxdesign/core': patch
---

[fix] Markdown links and images go to their destination when the source also gives them a title

`[notes](https://example.com/notes "Release notes")` linked to `https://example.com/notes "Release notes"` — an address that does not exist — and a titled image pointed at a source that could not load. A title after the destination, in double quotes, single quotes, or parentheses, is no longer part of the link or image address, and a destination in angle brackets may contain spaces. Content in any other shape keeps its meaning.

@cixzhang
