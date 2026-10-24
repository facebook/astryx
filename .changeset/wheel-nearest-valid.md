---
'@astryxdesign/core': patch
---

[fix] A picker wheel that stops on a value outside the bounds now settles on the nearest value inside them. Before, it bounced back to the value it started from. This applies to the wheels in the TimeInput, DateTimeInput and DateInput bottom sheets. For example, with `min="09:00"`, dragging the hour wheel from 10 to 7 settles on 9, as the iOS time picker does. A stop on a value inside the bounds is unchanged.

@vjeux
