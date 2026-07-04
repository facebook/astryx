---
'@astryxdesign/core': patch
---

[fix] CheckboxInput: stop setting a redundant `aria-checked="mixed"` on the native `<input type="checkbox">` for the indeterminate state. The native `indeterminate` DOM property (which browsers already map to `aria-checked="mixed"`) is authoritative; the extra attribute could desync from or override the native state (#3343).
@cixzhang
