---
'@astryxdesign/cli': patch
---

[feat] Add `astryx build` command for page composition, with natural-language search ranking.

`build "<idea>"` returns a composition kit — the closest page template, the
blocks that cover parts, and components to fill gaps, plus a Compose suggestion.
`build` with no args prints the how-to-build playbook. The shared search ranking
now handles oblique natural-language queries via tokenization + stopwords, a
synonym/intent map, light stemming, and page-template keyword enrichment.
@joeyfarina
