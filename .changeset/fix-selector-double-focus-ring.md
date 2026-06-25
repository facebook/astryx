---
'@astryxdesign/core': patch
---

[fix] Remove doubled focus ring on `Selector`. The inner combobox button drew
its own `:focus-visible` outline on top of the wrapper's `:focus-within` ring,
producing a stacked, rounded outline over the trigger after selecting an option
or navigating with the keyboard. The button now defers to the wrapper's focus
ring, matching `TextInput` and `NumberInput`.
@cixzhang
