---
'@astryxdesign/core': patch
---

[feat] FormLayout: add `defaultOptionality` — set a form-wide default (`'optional'` or `'required'`) so only the exception carries a visible indicator. Under `'optional'` only `isRequired` fields show one; under `'required'` only `isOptional` fields do; a field that restates the default shows nothing. Presentation only — a control's `aria-required` is unchanged. Unset keeps today's per-field behavior.

@freddymeta
