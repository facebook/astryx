---
'@astryxdesign/core': minor
---

[breaking] DateInput, DateRangeInput, DateTimeInput, and TimeInput no longer accept root `xstyle`, `className`, or `style`. Style the field with `containerXstyle`/`containerClassName`/`containerStyle` (the Field box; no effect inside InputGroup or a `horizontal-labels` FormLayout) and the visual control box with `controlXstyle`/`controlClassName`/`controlStyle`. Base props such as `ref`, `id`, `data-*`, `aria-*`, and DOM handlers reach the field's semantic control on every surface (the date, time, or date-time input; DateRangeInput's range trigger) instead of the wrapper, TimeInput no longer drops them, and a caller `id` is now honored there. A caller `aria-describedby` or `aria-labelledby` is added to the component's own.

Migration: rename root `xstyle`/`className`/`style` on these components to `controlXstyle`/`controlClassName`/`controlStyle`, which style the same element as before (for DateTimeInput, the row holding the date and time segments). `astryx upgrade` rewrites JSX usage; styling passed through a wrapper's own props or a spread is not rewritten and now fails type-checking at that callsite, so rename it there. Untyped callers get a development warning and the value is ignored. A handler or `data-*` attribute that relied on landing on the wrapper now lands on the control.

From #5656 by @harjothkhara.

@cixzhang
