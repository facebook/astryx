---
'@astryxdesign/cli': patch
---

[fix] A package with a namespace doc or a placed guide needs `@astryxdesign/cli` 0.6.4, not 0.7.0.

Published 0.6.4 reads an integration's docs tree: it lists the namespace and reads each guide placed in it. 0.6.3 rejects a namespace doc and hides every doc topic the package ships. `integration add doc --parent` wrote `"@astryxdesign/cli": ">=0.7.0"`, a range no released CLI satisfies, and `integration verify` failed a docs-tree package whose CLI peer started at 0.6.4. `integration add doc --parent` now writes `">=0.6.4"`, marked optional, and `integration verify` accepts it. A template that sets `replaces` or `keywords` still needs `">=0.7.0"`.

@josephfarina
