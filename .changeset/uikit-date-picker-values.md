---
'@astryxdesign/core': patch
---

[chore] Internal: UIDatePicker's values measured on iOS 26.2 join the UIKit constants table. For the inline calendar they cover how a day tap selects, the animated selection's spring, the title following a drag, the month grid's release rule, the chevron's step and its retarget, the disabled chevron at a bound, and the month/year toggle's fades and chevron turn. For the wheels they cover the AM/PM column following the hour, the looping hour and minute columns, minutes that do not carry, the turn back onto a bound, the day clamped to the month and the minute interval. The compact popover's springs are included too. Each value comes with its source. Not exported from the package entry point; no component reads it yet.

@vjeux
