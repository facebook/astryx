---
'@astryxdesign/core': patch
---

[docs] Correct useInteractiveRole isDisabled docs for disabled href (#3784)

The `isDisabled` JSDoc claimed a disabled `href` "falls back to button". It does not: a disabled `href` is skipped at the link step and resolved by the remaining priority checks, so with no `onClick` and no interactive context it lands on `'inert'` — as `Token` already relies on for disabled links. The `isDisabled` doc, the step-1 inline comment, and the priority summary now describe the actual behavior. Docs only; no runtime change.
@arham766
