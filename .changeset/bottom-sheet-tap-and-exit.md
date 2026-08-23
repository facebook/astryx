---
'@astryxdesign/core': patch
---

[fix] BottomSheet: a tap inside the sheet is a tap, and the sheet leaves on an exit curve (#5326).

Two defects, both of which read as "the sheet closes with no animation" — reported against the touch DateInput picker, which is a Bottom Sheet.

**A tap inside the sheet started a one-pixel drag.** The sheet body carries the pull-to-dismiss handlers, and they promoted to a sheet drag on _any_ downward movement. A finger is never still, so the pixel or two a tap drifts began a drag — and a live drag suppresses the panel's transition, correctly, because a dragged sheet must track the finger rather than lag it. The close that the tap triggered landed inside that window, so the sheet jumped to its closed position with no transition. Tapping the picker's Save button hit this every time; tapping the scrim never did, because the scrim is the dialog itself and arms no gesture. Promotion now needs 8px of travel — the conventional tap slop, well under what a deliberate pull covers in its first frames — in both the pointer and touch paths. The gesture's transition suppression is also scoped to a sheet that is open, so it cannot straddle an exit.

**The exit ran on the entrance's curve.** `--ease-standard` is `cubic-bezier(0.24, 1, 0.4, 1)`, a decelerate curve: it spends its speed immediately and coasts. Right for an entrance, wrong for an exit. Measured on device (iPhone, real Safari), a scrim tap put the sheet half off-screen in 59ms of the 410ms transition and 90% off in 163ms, with the dim gone before it — so the close was over before the eye could follow it. The closing state now carries an accelerating curve of its own, `cubic-bezier(0.3, 0, 0.6, 0.6)`: away from rest, gathering speed, quickest as it leaves the screen, and moving within ~50ms so it reads as one departure rather than a hesitation and a snap. Only the curve changes — the exit keeps `--duration-medium`, the entrance's band, which is what keeps it legible under a theme that scales the motion scale down (neutral's medium is 300ms against the base 410ms).

The scrim leaves with the sheet: while closing, the dim runs `linear` rather than the decelerate token. A fade covers no distance, so front-loading its progress just ends it early — the reasoning the touch date picker's surface swap already carries. `BottomSheetSwitcher` gets the same treatment when its flow closes; a handoff between two sheets is not a close and is unchanged.

@imdreamrunner
