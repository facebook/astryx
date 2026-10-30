---
'@astryxdesign/core': patch
---

[perf] Slider: the thumbs and the filled range move by `translate` in the control's container units instead of by inset and width, so moving the thumbs and the fill no longer lays out the page; with `valueDisplay="none"` a drag or step lays out nothing at all (the value tooltip and text display still lay out as their text changes). Rendering is unchanged, except in a left-to-right region inside a right-to-left page, where the thumb now sits on its value instead of one thumb width past it, and at the ends of a vertical slider, where the value tooltip now stays within the control. The value tooltip anchors to the slider's untransformed travel box and moves by the same `translate` as its thumb, so it sits over the thumb in every engine (engines disagree on whether CSS anchor positioning follows a `translate` on the anchor) with no added element, and inline padding on the control still moves no part. `useTooltip`'s `renderTooltip` now applies the `xstyle` and `style` its second argument already accepted.

@vjeux
