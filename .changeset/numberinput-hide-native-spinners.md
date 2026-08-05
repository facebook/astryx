---
'@astryxdesign/core': patch
---

[fix] NumberInput: hide the browser's native number spinners so the field matches the component's own visual treatment across browsers, and stop a focused wheel gesture (which steps the value) from also scrolling an ancestor container. Keyboard stepping and the `spinbutton` role are unchanged, so there is no accessibility impact.
@cixzhang
