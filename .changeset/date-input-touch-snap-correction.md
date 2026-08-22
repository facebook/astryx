---
'@astryxdesign/core': patch
---

[fix] DateInput's touch calendar no longer rests between two months (#5319)

Swiping the month calendar on iOS could leave it parked a couple of columns
into a pane: the left of March and the right of April on screen at once, under
one square Sun-to-Sat header, with the title still naming March. The grid was
never skewed — the scrollport was simply at rest where no month begins.

`scroll-snap-type: mandatory` is supposed to make that impossible, and on a
static list it does. This list is virtualized: seven panes exist out of twelve
hundred, and the panes ARE the snap areas, so every month the finger crosses
mounts one and unmounts another while the fling is still running. iOS scrolls
off the main thread — it picks a landing place from the snap points it knows
about at that moment, and a React re-render that lands after the decision
moves them. The scroller stops where a snap point used to be and nothing
re-snaps it. Chrome never showed it because it snaps again after the mutation.

The rest position is now corrected rather than trusted: once the gesture is
genuinely over — touch released, the scroller quiet, AND its offset confirmed
unchanged across a frame — a scroller that is off a pane boundary is moved to
the nearest one. A scroller the browser snapped for itself is left alone, so
nothing extra happens on Chrome, and sub-pixel drift on a fractional viewport
is ignored.

That last condition is what keeps the fix from becoming a worse bug than the
one it fixes. A quiet period is not proof of rest: iOS runs its own snap
animation for a few hundred milliseconds after the finger lifts and fires
scroll events irregularly while it does, so a correction that trusts quiet
alone can land mid-animation, round an offset still travelling toward next
month back to the month it came from, and reverse the swipe.

@imdreamrunner
