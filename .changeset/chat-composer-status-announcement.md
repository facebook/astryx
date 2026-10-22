---
'@astryxdesign/core': patch
---

[fix] ChatComposer: a status message is announced through the shared announcement channel, errors assertively and warnings politely, once per occasion: a rerender does not repeat it, and a status that clears and then returns is announced again. Before, the status bar mounted as a `role="alert"` or `role="status"` region already holding its text, which screen readers often skip. The visible bar no longer carries a live role. No API changes.

@kyu-rong
