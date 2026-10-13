---
'@astryxdesign/core': patch
---

[fix] Keep Slider endpoints selectable when the step does not divide the range. Pointer input and End now reach the explicit maximum. Arrow keys move to the adjacent selectable value from any off-grid value, not just the maximum, without skipping a step. For example, with `step={10}` and `value={55}`, ArrowRight now selects `60` instead of `70`.

@korkt-kim
