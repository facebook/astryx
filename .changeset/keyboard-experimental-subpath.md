---
'@astryxdesign/core': patch
---

[experimental] `@astryxdesign/core/keyboard/experimental` exports the keyboard layout guide for components that keep content above the software keyboard: `getKeyboardLayoutGuide(window)`, the `useKeyboardLayoutGuide(onTransition)` hook, and the `KeyboardLayoutGuide` and `KeyboardTransition` types. Each transition carries its start on the document timeline, dated back to where Mobile Safari's keyboard really is, so an element animated on `uikit.springs.keyboard` from it rides in step with the keyboard. Like the other experimental subpaths, it may change or be removed in a patch release.

@vjeux
