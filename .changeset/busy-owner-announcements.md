---
'@astryxdesign/core': patch
---

[fix] Extend task-owned loading announcements to ComplexSelector, BaseTypeahead, Typeahead, Tokenizer, DateInput, DateRangeInput, DateTimeInput, TimeInput, FileInput, CheckboxInput, Switch, DropdownMenuSubMenu, Thumbnail, and ChatMessageList history loading. Composed Spinners are decorative and carry no live role, including in TextInput, TextArea, Selector, and MultiSelector. The shared busy-owner hook delivers once per busy start without repeating on rerenders or indicator replacement. Native-dialog owners use an initially empty persistent region inside the dialog, defer undelivered loading until a closed dialog opens, and cancel pending delivery when work settles or the owner unmounts. CommandPalette also covers bootstrap and cleared-query loads independently of its CommandPaletteInput slot. Standalone Spinner behavior and public APIs are unchanged. Consumer tests should check the owning control's busy state or announcement region, rather than finding its composed Spinner by `role="status"`.

@korkt-kim
