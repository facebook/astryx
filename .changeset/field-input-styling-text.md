---
'@astryxdesign/core': minor
'@astryxdesign/cli': minor
---

[breaking] TextInput, TextArea, NumberInput, and FileInput no longer accept root `xstyle`, `className`, or `style`. Style the field with `containerXstyle`/`containerClassName`/`containerStyle` (the Field box; no effect inside InputGroup or a `horizontal-labels` FormLayout) and the visual control box with `controlXstyle`/`controlClassName`/`controlStyle`. Base props such as `ref`, `id`, `data-*`, `aria-*`, and DOM handlers reach the native control, and a caller `id` is now honored there. CLI templates use the new props.

Migration: rename root `xstyle`/`className`/`style` on these components to `controlXstyle`/`controlClassName`/`controlStyle`, which style the same element as before. `astryx upgrade` rewrites JSX usage; styling passed through a wrapper's own props or a spread is not rewritten and now fails type-checking at that callsite, so rename it there. Untyped callers get a development warning and the value is ignored.

From #5656 by @harjothkhara.

@cixzhang
