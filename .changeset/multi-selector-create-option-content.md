---
'@astryxdesign/core': patch
---

[feat] MultiSelector: `renderCreateOption` renders caller content in the `hasCreate` row in place of its `Create "<query>"` text, given `{query, label}`, so a create row can show what the new option will look like before it exists. The row stays a plain option, and its rendered text is its accessible name and what is announced when it is the only result.

@vjeux
