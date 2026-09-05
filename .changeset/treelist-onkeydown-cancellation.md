---
'@astryxdesign/core': patch
---

[fix] TreeList: respect consumer `onKeyDown` `preventDefault` cancellation for APG tree keyboard navigation

`TreeList` previously processed built-in APG keyboard navigation on the inner `<ul role="tree">` before consumer `onKeyDown` ran on the root `<div>`, preventing consumer `event.preventDefault()` from suppressing built-in arrow navigation.

Root `onKeyDown` now invokes consumer `onKeyDown` on the root container first and checks `event.defaultPrevented` before handling internal tree navigation for keydown events originating inside the `<ul role="tree">`. Calling `event.preventDefault()` in `onKeyDown` now successfully cancels built-in navigation and leaves focus and roving tabindex unchanged while preserving root handler target contracts.

@Geervan
