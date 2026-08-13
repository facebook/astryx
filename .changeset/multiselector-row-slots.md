---
'@astryxdesign/core': patch
---

[feat] MultiSelector: dropdown option rows are themeable through a single (#4628)
`multi-selector-option` target, carrying the row's `size` and its `select-all`,
`selected` and `disabled` states — so a theme can express "selected option at
large" or restyle just the Select All row. Row typography moved from the label
span onto the row, so one override reaches both the fallback label and
`renderOption` content; custom option content now inherits the row's font and
disabled color.
@athz
