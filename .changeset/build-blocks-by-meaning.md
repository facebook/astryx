---
'@astryxdesign/cli': patch
---

[feat] `astryx build` names the right block first far more often: it now ranks every block in the catalog by what the request means, read from each block's own name, description, and component, so a block search's words missed can still come first, with its own score and reason. A block the request names by its exact name, and a block from an integration, keep their place; the kit never lists more blocks than before, and the page call, start template, and alternatives are unchanged.

@josephfarina
