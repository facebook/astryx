---
'@astryxdesign/core': patch
---

[fix] Dialog content uses the theme's primary foreground instead of borrowing the triggering surface's text color, in modal and inline presentations. Existing dialog theme and root styling overrides still win.

@imdreamrunner
