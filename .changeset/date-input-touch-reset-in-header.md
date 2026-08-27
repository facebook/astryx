---
'@astryxdesign/core': patch
---

[fix] DateInput: move the mobile picker's Reset into the header's trailing
corner

On a touch device the picker's footer held Reset and Save side by side, two
half-width buttons of equal weight — so the row that ends the task also
offered the one action that throws the work away, a thumb's width from it.

Reset now sits at the top of the sheet, trailing of the month arrows: chrome,
in the band of controls that move the calendar without finishing anything.
The footer is Save alone, full width. Nothing about what Reset does changed —
it still clears the date and returns the calendar to the current month — and
it still leaves with the arrows when the month and year wheels come up, since
there is no date to clear on that surface.

@imdreamrunner
