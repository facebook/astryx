---
'@astryxdesign/core': patch
---

[fix] TextArea: remove the duplicate wrapper padding so the text and native resize grip sit flush to the edge. The wrapper's `padding: 0` shorthand was being overridden by the shared input-wrapper longhands, leaving the inset applied twice; it now zeroes with matching longhands.

@ernestt
