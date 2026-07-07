---
'@astryxdesign/core': patch
---

[fix] Spinner: promote the canvas to its own compositor layer (`willChange: transform`) so rotation stays smooth on WebKit — fixes wobbly spinning in Safari and Tauri WebViews. (#3628)
@MeGaurav4
