---
'@astryxdesign/core': patch
---

[feat] ChatComposerInput: add `shouldSubmitOnEnter` (boolean or per-keystroke predicate) and an `onKeyDown` seam so consumers can host platform-specific Enter behavior — e.g. send on Enter on desktop but insert a newline on a touch keyboard. Enter also no longer submits mid-IME-composition.
@ejc3
