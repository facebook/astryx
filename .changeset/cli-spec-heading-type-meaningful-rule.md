---
'@astryxdesign/cli': patch
---

[fix] `astryx theme build` now fails with `ERR_THEME_INVALID`, before writing anything, when a custom Heading type's standalone rule has no usable declaration: every value is blank, or the compiler dropped every declaration. It previously wrote CSS with an empty or missing rule and still added the type to the generated `HeadingTypeMap`. (#6547)

@josephfarina
