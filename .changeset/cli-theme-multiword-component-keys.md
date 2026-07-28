---
'@astryxdesign/cli': patch
---

[fix] `astryx theme build`: component-override keys for multi-word components (TextInput, DateInput, NumberInput, DropdownMenu, SideNav, TopNav, etc.) now match the hyphenated class the component actually renders. The known-component registry used de-hyphenated keys, so overrides authored against them emitted dead selectors (`.astryx-textinput` instead of `.astryx-text-input`) that silently never applied (#4109).

@cixzhang
