---
'@astryxdesign/core': patch
---

[feat] TextArea: the four elements inside the wrapper now carry stable theme targets — `astryx-textarea-control` (the `<textarea>`, reflecting `size`), `astryx-textarea-start-icon` (also reflecting `size`), `astryx-textarea-end-slot`, and `astryx-textarea-counter`. Only the wrapper was themeable before, so a theme adjusting the control's inset or the overlays anchored to it had to reach in with structural selectors (`.astryx-textarea > textarea`, `> span:has(+ textarea)`). Purely additive: no existing class, data attribute, or style changes.
@freddymeta
