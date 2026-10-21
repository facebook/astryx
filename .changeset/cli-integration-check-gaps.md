---
'@astryxdesign/cli': patch
---

[fix] `astryx doctor integration validate`, `astryx integration check` and `astryx integration verify` catch more package mistakes, and each new finding ends in a `Fix:` that clears it. Findings that 0.7.2 did not fail on are listed in validate's `layout` list, which nothing counts, until the next minor:

- Two docs for one component (`AcmeWidget.doc.mjs` and `AcmeWidget.doc.js`) are listed as `duplicate_component_doc`, naming the one read; discovery now always reads the same one.
- A component doc whose file name differs from its source only in letter case is one finding that says which file to rename: an error where the pair fails (Linux), a listed `source_without_component_doc` where it still pairs (a case-insensitive disk) or the doc is hidden.
- A root reached through a symlinked folder is listed as `symlinked_root`: npm pack does not follow it.
- An absolute root says roots are relative and gives the relative path; a root that is a file is reported by every check instead of crashing it.
- A package.json without `name` or `version` is listed with a fix, instead of a crash; `verify` fails on it. A package whose `name` and manifest `providerId` give no provider ID is listed as `no_provider_id`.
- A contribution file Astryx cannot read is listed as `unreadable_file`, before npm pack fails on it.

@josephfarina
