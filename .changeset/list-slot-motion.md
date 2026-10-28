---
'@astryxdesign/core': patch
---

[feat] With `animatedLayout` on `List`, a row's `startContent` and `endContent` changes animate: a control that appears (a Checkbox for selecting) enters, one that leaves exits in place, inert and out of the accessibility tree, handing its focus to the row without scrolling, and one replaced in the same slot (a remove button turning into Delete) swaps in place, while the row's label, and the rows after it when the row's height changes, glide. A replacement at the same size and a control re-rendering do not animate; a leaving slot that sets the row's height goes at once.

@cixzhang
