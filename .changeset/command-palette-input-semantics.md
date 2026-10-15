---
'@astryxdesign/core': patch
---

[fix] `CommandPaletteInput` gets accurate search semantics and a real name (AST-017 FR53; WCAG 2.2 4.1.2 Name, Role, Value):

- A standalone field with no popup attributes was `role="combobox"` with `aria-expanded="true"` and `aria-autocomplete="list"`; it is now `role="searchbox"` with no popup state. Pass `role="combobox"`, or your popup's own ARIA attributes, to keep the old semantics. A field that already passes popup attributes (`aria-expanded`, `aria-controls`, `aria-owns`, `aria-haspopup`, and the like) stays a `combobox` and keeps them, and a field inside `CommandPalette` is unchanged.
- The field's default accessible name was its placeholder (`Search…`, or the caller's `placeholder`); it is now `Search commands`, translated. Pass `label` to keep a specific name, for example `label="Search…"` for the old default. A caller whose custom `placeholder` served as the name keeps working code and hears the generic name until it passes `label`.
- `endContent={true}` no longer renders an empty trailing slot, and `endContent={0}` renders inside the trailing slot instead of after it.

@cixzhang
