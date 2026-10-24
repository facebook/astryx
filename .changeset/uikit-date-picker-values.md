---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[chore] Internal: UIDatePicker's values measured on iOS 26.2 join the UIKit constants table. For the inline calendar they cover how a day tap selects, the animated selection's spring, the title following a drag, the chevron's retarget, the disabled chevron at a bound, and the month/year toggle's fades and chevron turn. For the wheels they cover the AM/PM column following the hour, the looping hour and minute columns (a short minute list included), minutes that do not carry, the turn back onto a bound, the day clamped to the month and the minute interval. The compact popover's springs are included too. Each value comes with its source. Not exported from the package entry point.

The motion the date and time inputs play from it becomes motion roles a theme may retune once the inputs' touch code registers the table (nothing registers on import), and `astryx docs motion` lists them: `datePicker.calendar.monthYearToggle.fadeMs` (the month/year toggle's fades) and `datePicker.wheels.columnTurn.durationMs` and `datePicker.wheels.columnTurn.curve` (a wheel column the picker turns itself).

@vjeux
