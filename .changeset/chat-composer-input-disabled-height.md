---
'@astryxdesign/core': patch
---

[fix] `ChatComposerInput`: an empty input no longer shrinks by 8px when `isDisabled` flips to `true`, which shifted anything bottom-aligned beside it (e.g. a send button in a grid row).

The root's `minHeight` was set to the shared line-height only, not the padding `editable` and `placeholder` both add on top of it — normally immaterial, since the editable region reserves its own padded box even when empty. A disabled, empty `contentEditable` region stops reserving that empty line at all in Chromium, and the absolutely positioned placeholder standing in for it doesn't contribute to layout height, so the root fell back to just the line-height and lost the padding. `minHeight` now explicitly accounts for both.

@HelloOjasMutreja
