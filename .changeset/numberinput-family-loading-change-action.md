---
'@astryxdesign/core': patch
---

[feat] NumberInput: add family-aligned `isLoading` and `changeAction` support (#5778)

`NumberInput` now exposes the input-field family's `isLoading` and `changeAction`
concepts. `changeAction` runs after `onChange` for the same value change, inside a
React transition, and the proposed value is presented optimistically until the
controlled value accepts or replaces it — in the field text, in `aria-valuenow`,
in clear-button visibility, and as the base for further stepping, so repeated
steps during an in-flight action advance (1 → 2 → 3) instead of resubmitting the
same number. An explicit `isLoading` and a pending `changeAction` resolve to a
single busy presentation: one Spinner in the end lane plus `aria-busy` on the
input, never two indicators.

`changeAction` follows `onChange` through the existing `hasClear` split, widening
to `(value: number | null)` when the field is clearable. Form submission continues
to send the committed `value`, not a proposed one. Callsites that pass neither
prop are unaffected.

@Alif416
