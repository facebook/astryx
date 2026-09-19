---
'@astryxdesign/core': patch
---

[feat] Pressed state for Switch, SegmentedControl, TabList, Link, Slider, CheckboxInput, RadioList and Collapsible. Each paints the system's `--color-overlay-pressed` layer while it is pressed, the way Button already does, so a press answers on a mouse today and is ready for the touch press model: the Switch track and thumb, the unselected segment, the tab's hover surface, the link text's background, the dragged slider thumb, the checkbox box and radio circle, and the disclosure trigger row. Switch also forwards a caller's `id`, `aria-labelledby` and `aria-describedby` to its `<input role="switch">` (a visible row title or hint can name or describe the control).

@vjeux
