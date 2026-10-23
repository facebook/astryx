---
'@astryxdesign/core': patch
---

[fix] Toast: each toast is announced by its viewport alone. The toast card no longer carries its own live role, so screen readers do not hear it twice, and a toast shown over a Dialog is announced from inside the Dialog instead of through the page's live region, which a native modal makes inert.

@cixzhang
