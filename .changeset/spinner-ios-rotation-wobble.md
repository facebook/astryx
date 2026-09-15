---
'@astryxdesign/core': patch
---

[fix] Spinner: animate the arc's dash offset instead of rotating the ring, fixing residual wobble on iOS Safari (#6253)

The earlier fix for #3617 added `willChange: 'transform'` to the rotating `<svg>`, which smooths the rotation's motion but does nothing about how WebKit rasterizes a rotating stroked shape's rounded cap on each frame. Rotating the whole ring still visibly wobbled on iOS Safari.

Animates `stroke-dashoffset` on the stationary arc `<circle>` instead of rotating the `<svg>`, so the shape never rotates and WebKit never re-rasterizes the cap at an intermediate angle. Confirmed against a real iOS Safari device by the issue reporter.

@HelloOjasMutreja
