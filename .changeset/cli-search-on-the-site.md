---
'@astryxdesign/cli': patch
---

[feat] A site can answer what `astryx search` answers, in the browser: `gatherSearchCatalog()` (from `@astryxdesign/cli/api`) returns the catalog search ranks as JSON, and `searchCatalog()` from the new `@astryxdesign/cli/search` entry runs the same ranking on it with no disk or network. The docs site's search uses it, so it gives the CLI's results in the CLI's order.

@josephfarina
