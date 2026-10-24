---
'@astryxdesign/core': patch
---

[feat] Under a finger, pinching in on a zoomable Lightbox photo at its fitted size now closes the viewer into the photo's thumbnail, as in the iOS Photos viewer, on every touch screen.

While the fingers pinch in, the photo shrinks with them about the point between them and follows it. The backdrop fades on Photos' measured curve and the controls fade faster. A pinch that goes below about 93.5 % closes at the lift unless it is opened again by 5 % first: the photo flies into its thumbnail, or shrinks and fades in place when it has none. Any other pinch springs back to the fitted size.

A pinch that starts zoomed in still gives way below the fitted size and returns, without closing.

@vjeux
