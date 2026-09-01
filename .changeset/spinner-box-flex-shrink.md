---
'@astryxdesign/core': patch
---

[fix] Spinner: a narrow flex host no longer compresses the box and clips the ring (#5484)

The spinner's box carried `overflow: hidden` from the canvas ring it no longer draws. It clipped nothing — the painted circle is inscribed in the box, so hiding or showing the overflow renders the same pixels at every size and shade — but a flex item whose overflow is not `visible` has an automatic minimum size of zero. That left the box with no floor: a flex host narrower than the spinner compressed it while the ring kept drawing at the size its own attributes ask for, and the clip then cut the ring off at the box edge, silently, because a sliced ring still spins.

Ordinary layouts reached it. A `md` spinner beside a label in a 140px row rendered a 16px box around a 20px ring; an `lg` spinner next to a `flex: 1 0 100px` sibling lost half of its ring. The clip is gone and the box is `flex-shrink: 0`, so the box and the ring stay one measurement and a spinner that does not fit overflows its host visibly instead. Nothing moves for a spinner whose host already fitted it.

@freddymeta
