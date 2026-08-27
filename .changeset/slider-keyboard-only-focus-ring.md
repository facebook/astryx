---
'@astryxdesign/core': patch
---

[fix] Slider: dragging the thumb with a mouse no longer draws the keyboard focus ring

The thumb is a `div[role="slider"]`, and the track's `pointerdown` handler
calls `preventDefault()` and then focuses the thumb from script. Chromium
treats that script focus as focus-visible, so `:focus-visible` matched on
mouse-down and every drag came with a 2px accent ring — measured in Chromium,
not inferred.

`:focus-visible` stays the CSS condition; it is now narrowed by the existing
`interactionModality` utility, the same way PanelSearchInput and Selector
narrow theirs. Keyboard focus rings exactly as before, and a mouse grab of a
thumb that already had the ring drops it.

One deliberate difference from the text-input cases: a keypress after a mouse
drag brings the ring back. A text field has a caret to show where input is
going, and a slider thumb has nothing else.

@cixzhang
