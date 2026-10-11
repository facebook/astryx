---
'@astryxdesign/core': minor
'@astryxdesign/cli': minor
---

[breaking] Typeahead, Tokenizer, CheckboxList, RadioList, and Slider no longer accept root `xstyle`, `className`, or `style`. Style the field with `containerXstyle`/`containerClassName`/`containerStyle` (the Field box; no effect inside InputGroup or a `horizontal-labels` FormLayout) and the visual control box with `controlXstyle`/`controlClassName`/`controlStyle`. Base props now reach the primary semantic control: the combobox input for Typeahead and Tokenizer, the `role="group"`/`role="radiogroup"` element for CheckboxList and RadioList, and the `role="slider"` thumb for Slider (the `role="group"` control in range mode). A caller `aria-describedby` is kept alongside the field's own description and status, on these components and on TextInput, TextArea, and NumberInput, which previously dropped it. CLI templates use the new props.

Migration: rename root `xstyle`/`className`/`style` to the part they styled before: `containerXstyle`/`containerClassName`/`containerStyle` on all five components, except a Typeahead inside InputGroup, whose root styling painted the control surface and moves to `controlXstyle`/`controlClassName`/`controlStyle`. The release's `astryx upgrade` codemod, `migrate-field-input-styling`, performs these renames on JSX usage.

Not rewritten by the codemod, so update by hand:
- `ref` and `id`, plus `data-*` (except Typeahead and Tokenizer `data-testid`, which marked the control surface), `aria-*`, and DOM event handlers such as `onClick`, previously landed on the outer Field (or were dropped by RadioList and Slider). They now land on the primary semantic control. Update code that measured, queried, or listened on the outer field, and wrap the component in your own element when you need an outer boundary.
- Typeahead and Tokenizer refs are now `HTMLInputElement`.
- A consumer `onKeyDown` on Typeahead or Tokenizer still runs after the built-in key handling and cannot cancel it, but it now runs on the combobox input, so it no longer fires for keys on the clear button or tokens.
- Tokenizer's `onFocus`/`onBlur` keep their meaning: focus entering or leaving the field.
- Styling passed through a wrapper's own props or a spread is not rewritten and now fails type-checking at that callsite.

Untyped callers get a development warning and the value is ignored.

From #5656 by @harjothkhara.

@cixzhang
