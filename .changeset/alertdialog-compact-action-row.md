---
'@astryxdesign/core': patch
---

[fix] AlertDialog: on a compact viewport (narrower than 744px or shorter than 500px) the two actions follow the iOS alert. They share a row, Cancel leading, when each label fits its half of the row on one line, and stack with the destructive action above Cancel only when one does not. Before, they always stacked at 640px and below. Wide viewports are unchanged.

@vjeux
