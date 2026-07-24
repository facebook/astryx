---
'@astryxdesign/core': patch
---

[feat] ChatComposerInput: add an `onKeyDown` seam so consumers can host platform- or app-specific key handling — e.g. `preventDefault()` Enter to insert a newline on a touch keyboard, or submit on Cmd/Ctrl+Enter. Enter also no longer submits mid-IME-composition.
@ejc3
