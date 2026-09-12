---
'@astryxdesign/cli': patch
---

[fix] Fix `theme build` emitting invalid JS identifiers for theme names containing hyphens or dots followed by digits. The output identifier is now derived deterministically from `theme.name` by camelCasing across `-` and `.` separators (underscores are preserved as valid identifier characters). Names like `chaos-07` correctly produce `chaos07Theme` instead of the unparseable `chaos-07Theme`.

@josephfarina
