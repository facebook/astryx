---
'@astryxdesign/core': patch
---

[fix] AlertDialog: the cancel button now carries `data-autofocus`, so the documented "initial focus goes to the cancel button" behavior is pinned instead of depending on cancel happening to be the first focusable node in the footer. Docs now name and link the WAI-ARIA APG Alert Dialog pattern the component implements, and gain an anatomy section.

@cixzhang
