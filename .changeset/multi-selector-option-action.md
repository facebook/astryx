---
'@astryxdesign/core': patch
---

[feat] `MultiSelector` can render a secondary action beside an option.

A new `renderOptionAction` prop renders a control beside an option — an Edit
button for a carried label — outside the option's click target: the
`role="option"` row and the action are siblings in a `role="none"` wrapper, so
the option stays one target and the action is a real, Tab-reachable control.
While any row carries an action, Tab moves into the panel instead of closing
it. Off by default; existing selectors are unchanged.

@vjeux
