---
'@astryxdesign/core': patch
---

[fix] FileInput: `aria-describedby`, `aria-required`, and `aria-invalid` now sit on the focusable `role="button"` control instead of the visually-hidden `tabIndex={-1}` file input that never receives focus. Screen-reader users now hear the field's help text, required state, and error state. The hidden native input is also marked `aria-hidden` since it is not focusable (#3343).
@cixzhang
