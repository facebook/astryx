---
'@astryxdesign/core': patch
---

[fix] VisuallyHidden keeps its clip block and its DOM clean: `xstyle`, `className` and `style` no longer reach the element. The component's contract is that content in the accessibility tree stays invisible, so its clip block is meant to be non-overridable — but the implementation spread leftover props onto the element, which wrote the literal attribute `xstyle="[object Object]"` into the DOM, and let the same props arriving through a cast or a `{...consumerProps}` object take the last word on `position` and un-hide the node while assistive technology kept announcing it.

Measured prop by prop against `main`'s implementation, before and after this change:

- `xstyle` arrived as the attribute only — the `style` attribute stayed `null` and the clip classes were the same set in both arms — so a consumer passing it loses a stray attribute and no pixel.
- `className` was already displaced by the clip block's own class list; it reaches the element in neither arm.
- `style` did reach the element (`style="position: static;"`), and an inline declaration outranks a class rule, so the node was un-hidden. It stops reaching the element. That is the one rendering change here, and it moves the node back to the hidden state the contract calls non-overridable.

None of the three is styling surface on `VisuallyHiddenProps` — `className` and `style` are behind its `Omit`, reaching the element only through a cast or an untyped spread, and `xstyle` is documented as ignored — so no typed call site loses an effect it was promised.

`xstyle` stays declared on `VisuallyHiddenProps`, documented as ignored, because released 0.7.2 accepted it through `BaseProps`: removing it from the interface makes `<VisuallyHidden xstyle={…}>` stop compiling, and AST-017 FR31 and FR53 admit that narrowing only as a `[breaking]` change in a planned minor. It is deliberately not marked `@deprecated`: under FR28 a patch that deprecates a surface has to ship the exact migration or a codemod with it, and this fix ships neither. The removal and its migration belong to a planned minor, and the migration is to delete the prop — it applies nothing to the element.

@aashish254
