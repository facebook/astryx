---
'@astryxdesign/cli': patch
---

[feat] `astryx search` orders the matches inside each score band so the entry you are after comes first more often; every result keeps its match score and reason, and a query that is an entry's exact name still answers with that entry first. Introduced in [#7752](https://github.com/facebook/astryx/pull/7752); final-state evidence: [#7895](https://github.com/facebook/astryx/pull/7895) and [#7897](https://github.com/facebook/astryx/pull/7897).
`astryx build` names the right block first more often; its page call, start template, and alternatives are unchanged.

@josephfarina
