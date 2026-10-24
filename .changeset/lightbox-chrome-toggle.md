---
'@astryxdesign/core': patch
---

[feat] On a touch screen, tapping a zoomable Lightbox photo now hides the controls and caption, and the background turns black, as in the iOS Photos viewer. The next tap on the photo, or beside it, brings them back.

Zooming in by touch hides the controls the same way: a double tap as it zooms, or a pinch as soon as it passes the fitted size. Returning to the fitted size shows them. While the photo is zoomed, the background stays black and a tap toggles only the controls. The fades follow Photos' timing: the controls fade over 0.2 s, and the background turns black 0.1 s after them. While the controls are hidden:

- a tap beside the photo shows them instead of closing the viewer;
- a caption paged into view arrives hidden;
- a cancelled drag down brings them back;
- a keyboard focus on a control shows them.

A mouse click leaves the controls in place.

@vjeux
