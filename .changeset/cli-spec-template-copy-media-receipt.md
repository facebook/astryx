---
'@astryxdesign/cli': patch
---

[fix] `astryx template <name> <path>` now says when it replaced Astryx demo media. The `template.copy` receipt carries `demoMediaReplaced`, the number of demo image and video references in the written file that became placeholders, and the text output names the file to update. Nothing about the copy itself changed.

@josephfarina
