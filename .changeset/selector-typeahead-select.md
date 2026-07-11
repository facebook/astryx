---
'@astryxdesign/core': patch
---

[fix] Selector selects by typing, matching a native select (#3764)

Typing a printable character on a focused, closed Selector now selects the matching option — tab to a state picker, press "C", get "CA" — instead of doing nothing until the menu is opened. Repeated presses cycle through options sharing a first letter, spaces count as match characters ("new y" reaches "New York"), and the buffer resets after 500ms. With the menu open, typing moves the highlight and Enter commits, as before. With `hasSearch`, typing on the closed trigger opens the popup and seeds the search input.

Because the committed value changes without opening the popup or moving focus, the new selection is announced through a polite live region.

`useCombobox` gains `hasTypeahead` (default `true`). CommandPalette now passes `hasTypeahead: false`: its own input already filters the items and forwards every keystroke to the hook, so prefix matching on top of that could drag the highlight — and what Enter commits — onto a command the user never picked.

@AKnassa
