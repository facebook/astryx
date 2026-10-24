---
'@astryxdesign/core': patch
---

[feat] Pinching in on a zoomable Lightbox photo at its fitted size now closes the viewer into the photo's thumbnail, as in the iOS Photos viewer.

While the fingers pinch in, the photo shrinks with them about the point between them and follows it. The backdrop fades on Photos' measured curve and the controls fade faster. On release, a pinch below about 93.5 % closes: the photo flies into its thumbnail, or shrinks and fades in place when it has none. A pinch released above that, or reopened by 5 % before the lift, springs back to the fitted size.

A pinch that starts zoomed in still gives way below the fitted size and returns, without closing.

@vjeux
