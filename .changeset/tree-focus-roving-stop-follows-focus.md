---
'@astryxdesign/core': patch
---

[fix] `useTreeFocus` (and so `TreeList`): with `hasRovingTabIndex`, `handleFocus` moves the roving tab stop to the item that received focus, so a click or programmatic focus on an item no longer leaves `tabindex="0"` on the previous one.
@AKnassa
