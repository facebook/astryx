---
'@astryxdesign/core': patch
---

[fix] Button: link-rendered buttons (`href`) now expose `aria-busy` while loading, matching the `<button>` branch. Previously an interruptible loading link showed the spinner and announced "Loading" but carried no machine-readable busy state.
@bhamodi
