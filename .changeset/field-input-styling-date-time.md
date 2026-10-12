---
'@astryxdesign/core': minor
---

[breaking] DateInput, DateRangeInput, DateTimeInput, and TimeInput no longer accept root `xstyle`, `className`, or `style`. Style the field with `containerXstyle`/`containerClassName`/`containerStyle` (the Field box; no effect inside InputGroup or a `horizontal-labels` FormLayout) and the visual control box with `controlXstyle`/`controlClassName`/`controlStyle`. Base props such as `ref`, `id`, `data-*`, `aria-*`, and DOM handlers reach the field's semantic control on every surface (the date, time, or date-time input; DateRangeInput's range trigger) instead of the wrapper, TimeInput no longer drops them, and a caller `id` is now honored there. A caller `aria-describedby` is added to the component's own description ids, and a caller `aria-labelledby` is read after the field's own label (on DateRangeInput, after its label and selected range); a caller `aria-label` on DateRangeInput replaces the trigger's name. (#7337)

Migration: rename root `xstyle`/`className`/`style` on these components to `controlXstyle`/`controlClassName`/`controlStyle`, which style the same element as before (for DateTimeInput, the row holding the date and time segments). Rename by hand, or run `astryx upgrade` once it includes the `migrate-field-input-styling` transform, which rewrites JSX usage; styling passed through a wrapper's own props or a spread is never rewritten and now fails type-checking at that callsite, so rename it there. Untyped callers get a development warning and the value is ignored. A DOM handler or `data-*` attribute that relied on landing on the wrapper now lands on the control; a handler still runs after the component's own and still receives events the component handled.

From #5656 by @harjothkhara.

@cixzhang
