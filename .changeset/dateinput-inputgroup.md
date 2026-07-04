---
'@astryxdesign/core': patch
---

[feat] DateInput composes inside InputGroup (#3520)

DateInput now consumes InputGroupContext the same way TextInput, NumberInput, and TimeInput do: when grouped it drops its own Field chrome, applies the shared group border/radius styling, suppresses the local status icon, and composes the group label/description/status with its own input ARIA via the shared helper. The calendar popover and disabled-reason tooltip work unchanged in both modes.
@arham766
