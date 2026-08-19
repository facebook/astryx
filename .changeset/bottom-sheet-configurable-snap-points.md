---
'@astryxdesign/core': patch
---

[feat] BottomSheet: `snapPoints` makes the drag-to-resize stops the host's choice. A stop is the sheet's visible height, written as a viewport fraction (`0.5`), a percentage (`'50%'`), or a px length (`'320px'`) — matching `height`, where a bare number is also px and a string carries its unit. Fractions and percentages re-resolve when the viewport changes, so a sheet keeps the stop the user chose across a rotation, and swapping the points under a resting sheet re-anchors it the same way. A stop of a quarter of the sheet or less is a peek: it slides away rather than reflowing into a sliver, and thins the scrim. Taller stops are working surfaces, so they lay their content out and keep the scrim full — previously the shortest stop was always a peek, which would have thinned the backdrop of a half-height sheet (#5203).

Behavior change, deliberate and not breaking: every sheet used to carry three built-in stops (14%, 50% and 92% of the viewport), so a drag could leave it resting somewhere the host never asked for. A sheet now opens and closes unless `snapPoints` says otherwise; pass `snapPoints={[0.14, 0.5, 0.92]}` to keep the old stops. No prop, type, or DOM output was removed or renamed, and swipe-to-dismiss, the height budgets, and mobile-keyboard accommodation are untouched.

@imdreamrunner
