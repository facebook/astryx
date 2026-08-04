---
'@astryxdesign/core': patch
---

[fix] TextArea: the `<textarea>` now spans the full input container, with icons, status/spinner, and the character counter as absolutely-positioned overlays. The native resize grip sits in the container's bottom-right corner and the scrollbar covers the whole field. The `maxLength` counter moved inside the container, anchored bottom-right beneath the text (#4233).
@cixzhang
