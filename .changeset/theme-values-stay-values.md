---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[fix] Keep authored theme declarations inside their CSS boundaries. Drop only an unsafe declaration, preserve valid CSS values and legacy token generation, and continue compiling the rest of the theme. Runtime reports dropped declarations on the console; theme builds include them in the existing receipt warnings. CSS generators accept an optional warning-text array for build collectors, without a callback API or additional exported diagnostic types. (#5529)

@bhamodi
