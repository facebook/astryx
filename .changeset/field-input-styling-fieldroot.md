---
'@astryxdesign/core': minor
'@astryxdesign/cli': minor
---

[breaking] Typeahead, Tokenizer, CheckboxList, RadioList, and Slider no longer accept root `xstyle`, `className`, or `style`. Style the field with `containerXstyle`/`containerClassName`/`containerStyle` (the Field box; no effect inside InputGroup or a `horizontal-labels` FormLayout) and the visual control box with `controlXstyle`/`controlClassName`/`controlStyle`. Base props now reach the primary semantic control: the combobox input for Typeahead and Tokenizer, the `role="group"`/`role="radiogroup"` element for CheckboxList and RadioList, and the slider control for Slider. CLI templates use the new props.

Migration: rename root `xstyle`/`className`/`style` on these components to `containerXstyle`/`containerClassName`/`containerStyle`, which style the same Field box as before; `astryx upgrade` rewrites JSX usage. Not rewritten by the codemod: `ref`, `id`, `data-*` (including `data-testid`), `aria-*`, and DOM event handlers such as `onClick` previously landed on the outer Field (or were dropped by RadioList and Slider) and now land on the primary semantic control, so update code that measured, queried, or listened on the outer field; wrap the component in your own element for an outer boundary. Typeahead and Tokenizer refs are now `HTMLInputElement`. Tokenizer's `onFocus`/`onBlur` keep their focus-enters/leaves-the-field meaning. Styling passed through a wrapper's own props or a spread is not rewritten and now fails type-checking at that callsite. Untyped callers get a development warning and the value is ignored.

From #5656 by @harjothkhara.

@cixzhang
