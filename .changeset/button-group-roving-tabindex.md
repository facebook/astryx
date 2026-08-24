---
'@astryxdesign/core': patch
---

[fix] ButtonGroup is a single tab stop. Its members now share one roving tab stop instead of taking one each, so a three-button group costs one Tab press rather than three. Arrow keys move between members along the orientation (flipped in RTL), Home/End jump to the ends, focus wraps, and disabled members are skipped. Two consequences worth knowing: a keyboard script or test that tabbed through a group member by member must use arrow keys now, and a member rendered as a link (`href`) joins the arrow order for the first time. (#5389)

@cixzhang
