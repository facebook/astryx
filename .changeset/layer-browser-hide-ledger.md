---
'@astryxdesign/core': patch
---

[fix] useLayer: a layer that a popover hide the browser runs itself wakes through its focus restore — a tooltip on the trigger that a light dismiss or an Escape the browser's close watcher answers hands focus back to — no longer asks the browser to show while that hide is still running, which threw an `InvalidStateError` to the page in Chromium 150+ and left the layer closed; the show waits for the hide to end and then runs, so the layer ends shown.

@vjeux
