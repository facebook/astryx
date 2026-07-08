---
'@astryxdesign/core': patch
---

[docs] Document the full `themeProps()` selector surface in component theming targets. A sweep of every `themeProps()` call against the `theming.targets` entries found 19 gaps across 16 components where a visual prop or state had no documented `data-*` selector, so the CLI theming table hid part of the themeable surface: missing target entries (Citation, ToggleButton, Banner content, OverlayScrim, NavHeadingMenu, NavHeadingMenuItem) and missing `visualProps`/`states` on existing entries (Chat message density, Checkbox, Code color, CodeBlock container, DropdownMenu item size, SegmentedControl item, SelectableCard variant, SideNav item, Timestamp format, Tokenizer status, TopNav item selected, TreeList item density, Typeahead size).
@arman-luthra
