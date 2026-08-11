---
'@astryxdesign/cli': patch
---

[fix] `extractComponents` reported phantom components from local helper functions in template files — e.g. "Timeline", derived from a locally-defined `TimelineSection` helper in the detail-page template, which isn't a real component and was never imported from @astryxdesign/core. It now only reports names actually imported from @astryxdesign/core.

@abu-abdullah22
