---
'@astryxdesign/cli': patch
---

[fix] `astryx component --list` and `astryx search` find VStack, HStack and Heading

Each has its own import path, but its doc lives in its family's folder: Stack's
doc documents HStack and VStack, and Heading's doc sits next to Text's. The list
only counted a doc in the component's own folder, so the three were missing from
the list and from search, and `astryx component VStack` found its doc only
through fuzzy matching. A component whose doc is elsewhere is now listed and
searchable with its own import path, and `astryx component VStack` opens its doc
directly.

@josephfarina
