---
'@astryxdesign/core': patch
---

[fix] ProgressBar: guard the value label against a zero max

When `max` was `0` (or negative), the default value-label formatter produced `NaN%` (`0/0`) or `Infinity%`. That string was rendered visually and written into `aria-valuetext`, so screen readers announced "NaN percent". Guard it the same way the fill percentage already is (`max > 0 ? … : 0`).
@raphaelroshanM
