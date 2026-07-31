---
'@astryxdesign/cli': patch
---

[fix] `astryx theme build`: hyphenated component-override keys now resolve their built-in visual-prop values, and the `KNOWN_COMPONENTS` prop lists match what each component renders (#4109)

`loadKnownValues` mapped a theme key to its core component directory by stripping non-letters from only the directory name, so a hyphenated key (`text-input`, `dropdown-menu`, `app-shell`, ...) never matched its `TextInput`/`DropdownMenu`/`AppShell` dir and the built-in prop values were silently dropped. It now strips non-letters from both sides before comparing, so hyphenated keys resolve. The `KNOWN_COMPONENTS` visual-prop lists are also synced to each component's `theming.targets[].visualProps` (e.g. `text-input`/`date-input`/`number-input`/`time-input`: `size`, `status`; `side-nav`: `mode`; `aspect-ratio`: `shape`), correcting stale/empty entries.

@jiunshinn
