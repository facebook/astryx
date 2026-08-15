---
'@astryxdesign/core': patch
---

[fix] Slider: the thumb no longer overhangs the component's own box at `min` and `max`. It was centred on the container edge at either extreme, leaving half of it (10px) outside the control, where a tight container clipped it or it overlapped the next element. Thumb travel is now inset by half a thumb at each end — the geometry a native `input[type=range]` uses — and the fill, the marks and the pointer-to-value mapping share that inset, so the thumb also stays under the pointer that grabbed it instead of jumping by up to half its width. Vertical sliders and both thumbs of a range slider are fixed the same way.

@cixzhang
