---
'@astryxdesign/core': patch
---

[fix] PowerSearch `menuWidth` now sizes the field-search menu

`PowerSearch` has accepted a public `menuWidth` prop that nothing read: the
field-search menu always matched the input and grew with its content, and a
consumer wanting a wider menu had no way to ask for one. The prop now reaches
the menu. `Typeahead`, `Tokenizer` and `BaseTypeahead` gain the same prop, so
the whole typeahead family sizes its menu the same way.

Two details worth knowing:

- The menu never renders narrower than the input. The `anchor-size(width)`
  floor already in place stays, and a `menuWidth` below the input's width is
  ignored by CSS rather than clamped in JS.
- Only the field-search menu is affected. The operator and value popovers that
  follow a field choice keep tracking the input.

`menuWidth` also widens from `number` to `number | string`, matching
`DropdownMenu`, `DropdownMenuSubMenu` and `ContextMenu`, so a CSS length like
`'32rem'` works as well as pixels. Existing numeric values are unaffected.

@cixzhang
