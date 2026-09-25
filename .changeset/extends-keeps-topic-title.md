---
'@astryxdesign/cli': patch
---

[fix] An integration topic that `extends` another no longer renames it. `astryx docs theme` with an extension installed used to print the extension's own title and description; the topic now keeps its own, and the extension only adds or replaces sections. A topic that `replaces` another still renames it.

@josephfarina
