---
'@astryxdesign/core': minor
'@astryxdesign/cli': minor
---

[breaking] Selector, MultiSelector, and ComplexSelector no longer accept root `xstyle`, `className`, or `style`. Style the field with `containerXstyle`/`containerClassName`/`containerStyle` (the Field box; no effect inside InputGroup, a `horizontal-labels` FormLayout, or with `renderTrigger`) and the visual control box with `controlXstyle`/`controlClassName`/`controlStyle`. Base props such as `ref`, `id`, `data-*` (including `data-testid`), `aria-*`, and DOM handlers reach the trigger button that carries the combobox role (or, with `renderTrigger`, the caller's control), and a caller `aria-describedby` is kept alongside the field's own description and status instead of being replaced. Handlers keep their existing order: a ComplexSelector `onClick` on its own trigger can still cancel opening, and newly forwarded handlers (including those reaching a `renderTrigger` control) run after the built-in toggle and keyboard handling. CLI templates use the new props.

Migration: rename root `xstyle`/`className`/`style` on these components to `controlXstyle`/`controlClassName`/`controlStyle`, which style the same element as before. Not a rename: a `data-testid` or other base prop now lands on the trigger button rather than the bordered box around it (query the box with `.closest()` if a test measured it), and with `renderTrigger` base props and `ref` now reach the caller's control. Rename JSX usage by hand, or with `astryx upgrade` once its `migrate-field-input-styling` transform is available; that transform does not follow styling passed through a wrapper's own props or a spread, which now fails type-checking at that callsite, so rename it there. Untyped callers get a development warning and the value is ignored.

From #5656 by @harjothkhara.

@cixzhang
