---
'@astryxdesign/core': patch
---

[fix] TreeList: compose consumer `onKeyDown` with built-in APG tree keyboard navigation

`TreeList` passed `onKeyDown` to the root `<div>` via `restProps` while attaching `handleKeyDown` to the inner `<ul role="tree">`. Because keyboard events originate on `treeitem` elements inside `ul`, the built-in navigation handler ran before the consumer handler, preventing consumer `event.preventDefault()` from suppressing built-in arrow navigation.

Consumer `onKeyDown` is now composed with `handleKeyDown` on the `<ul role="tree">` element via `composeEventHandlers`. Calling `event.preventDefault()` in `onKeyDown` now successfully cancels built-in navigation and leaves focus and roving tabindex unchanged.
