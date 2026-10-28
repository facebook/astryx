---
'@astryxdesign/core': patch
---

[feat] With `animatedLayout` on `List`, a row's `startContent` and `endContent` changes animate: a control that appears (a Checkbox for selecting) enters, one that leaves plays out where it was, inert and out of the accessibility tree, handing its focus to the row without scrolling, and one replaced in the same slot (a remove button turning into Delete) swaps in place, while the row's label, and the rows after it when the row's height changes, glide. A control that changes size in place moves the label too; a change at the same size does not animate, and a leaving slot that sets the row's height goes at once.

@cixzhang
