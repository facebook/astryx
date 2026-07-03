---
'@astryxdesign/core': patch
---

[feat] Add `useKeyboardHint` — shows an ephemeral "← → to navigate" badge anchored to the focused item when a composite widget first receives keyboard focus. Teaches sighted keyboard users that arrow keys navigate within a roving-tabindex group. Renders in the top layer (`popover="manual"`) with CSS anchor positioning so it is never clipped by overflow containers. Auto-dismisses on first arrow press, timeout, or blur; does not re-show for that instance. `aria-hidden` (visual-only; screen-reader users already hear the role).
@cixzhang
