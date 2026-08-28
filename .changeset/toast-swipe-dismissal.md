---
'@astryxdesign/core': patch
---

[feat] Toast now supports touch and pen swipe dismissal toward its configured viewport edge. The vertical axis matches each Toast's top/bottom placement and entrance/exit motion, so the dismissal follows the same spatial model instead of introducing a separate side exit. Native touch scrolling is preserved until movement resolves to the dismiss direction, interactive controls do not start a swipe, and swipe continues to report the existing manual dismissal reason. Pen is included as direct-contact input; mouse drag is excluded because desktop users already have the visible close control and dragging can conflict with text selection.

@rubyycheung
