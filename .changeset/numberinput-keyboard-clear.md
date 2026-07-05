---
'@astryxdesign/core': patch
---

[fix] NumberInput with hasClear commits null when cleared from the keyboard (#3599)

Deleting the text and blurring (or pressing Enter) silently reverted to the previous value — only the X button honored the clearable contract. An emptied input now commits onChange(null) on blur/Enter when hasClear is set; non-clearable inputs keep the revert behavior.
@arham766
