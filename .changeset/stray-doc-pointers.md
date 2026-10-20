---
'@astryxdesign/cli': patch
---

[feat] `astryx doctor integration docs` lists each code span in an integration's prose that is exactly `astryx docs <name>` for a doc that exists, and says which `{@link}` to write instead: `{@link generic:<name>}` for the package's own topic, `{@link @astryxdesign/cli:generic:<name>}` for Core's. The link prints the same command, and doctor's link check fails it if the doc goes away. A command with more words, a route, or a code block is not listed. Each is a `stray_doc_pointer` warning, so `astryx integration check --strict` fails on it, and is in the new `strayPointers` field; `doctor integration docs` keeps exit 0. Core's own guides point with links, and a test keeps them that way.

@josephfarina
