---
'@astryxdesign/core': patch
---

[feat] TextArea: theme the text inset by writing `paddingInline` on the `textarea` component key — it now drives the internal `--_textarea-inline-padding` var instead of landing on the wrapper. The wrapper stays flush (`padding: 0`), so the native resize grip keeps its true-corner position and the start icon, status, and character counter stay aligned to the text. Adds a `replaces` option to derived var entries for the general "map a property onto a var without emitting it on the class element" case. (#4793)

@freddymeta
