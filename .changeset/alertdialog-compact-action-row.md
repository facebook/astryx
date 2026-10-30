---
'@astryxdesign/core': patch
---

[fix] AlertDialog: under a finger on a compact viewport (narrower than 768px or shorter than 500px by default, the theme's compact definition) the two actions follow the iOS alert, on every touch device. They share a row, Cancel leading, when each label fits its half of the row on one line, and stack with the destructive action above Cancel only when one does not. Before, they always stacked at 640px and below, which they still do with a mouse. Wide viewports are unchanged.

@vjeux
