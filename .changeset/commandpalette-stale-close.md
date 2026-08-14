---
'@astryxdesign/core': patch
---

[fix] CommandPalette: discard in-flight search responses when the palette closes (#3896)

Closing the palette while a search was still in flight let the late response re-commit the abandoned query and results into the closed palette, which showed up as a ghost query on reopen. Closing now invalidates any pending request.
@arham766
