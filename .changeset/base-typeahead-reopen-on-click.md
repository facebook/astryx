---
'@astryxdesign/core': patch
---

[fix] `Typeahead`, `Tokenizer`, and `PowerSearch` (which composes `Tokenizer`): clicking the search/combobox input after the dropdown closed without a blur now reopens it.

`BaseTypeahead` only ever opened its dropdown in response to a real `focus` event. Any flow that closes the dropdown while leaving the input focused — selecting a result (which re-focuses the input internally after clearing it), pressing Escape, or a composing component (`PowerSearch`'s token add/remove, e.g.) imperatively re-focusing the same input once it's done — dispatches no new `focus` event, since `focus()` is a no-op on an element that's already the active element. The input looked focused and clickable, but clicking it did nothing until the user clicked elsewhere first and back.

`BaseTypeahead` now also opens on click, specifically when the input was already focused before the click began (checked at `pointerdown`, before the browser's own default action moves focus — a click that itself just caused the input to gain focus is left to the existing focus path, so the two don't double-fire a bootstrap fetch on a single first click).

Only `Typeahead` and `Tokenizer` compose `BaseTypeahead` directly — `Selector`, `MultiSelector`, `CommandPalette`, and `DateTimeInput` use their own separate combobox implementations (which only follow `BaseTypeahead`'s conventions, not its code) and are unaffected by this change.

Fixes #6845.

@HelloOjasMutreja
