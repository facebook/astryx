---
'@astryxdesign/core': patch
---

[feat] FormLayout: add `defaultOptionality` — set a form-wide default (`'optional'` or `'required'`) so only the exception carries a visible indicator. Under `'optional'` only `isRequired` fields show one; under `'required'` only `isOptional` fields do; a field that restates the default shows nothing. Under `'required'` the unmarked fields also expose `aria-required` so screen readers match what sighted users see — resolved on `aria-required` only, never the native `required` attribute. Unset keeps today's per-field behavior.

@freddymeta
