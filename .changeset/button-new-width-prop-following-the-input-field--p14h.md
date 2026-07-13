---
'@astryxdesign/core': patch
---

[feat] Button: new `width` prop following the input field width convention (`SizeValue`: numbers are pixels, strings are used as-is). `width="100%"` removes the need for a `width: '100%'` xstyle override or a stretch layout wrapper for full-width CTAs in auth forms, dialogs, and mobile layouts (#2600).
@jiunshinn
