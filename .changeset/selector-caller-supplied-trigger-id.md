---
'@astryxdesign/core': patch
---

[fix] Selector: a caller-supplied `id` now drives the trigger's whole identity, not just its `id` attribute

`Selector` generated its trigger id with `useId()` and set it on the trigger button before spreading `...rest`, so a caller's `id` — accepted through `BaseProps` — replaced it on the button while the generated value stayed behind as the target of the listbox's `aria-labelledby` and of the `Field` label's `htmlFor`. Passing `id` therefore left the listbox with no accessible name and the field label pointing at an element that does not exist, silently and with a clean typecheck, lint and build.

The internal identity is now derived from the caller's `id` when there is one, so the button, the listbox's `aria-labelledby` (both the plain and the `hasSearch` panel) and `Field`'s `inputID` all name the same element. The trigger's own `id` attribute is unchanged in every case; what changes is that references which used to dangle now resolve — including the field label, which consequently regains its native click-to-focus behaviour. With no `id` supplied the rendered output is identical to before.

@cixzhang
