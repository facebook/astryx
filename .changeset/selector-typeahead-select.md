---
'@astryxdesign/core': patch
---

[fix] Selector selects by typing, matching a native select (#3764)

Typing a printable character on a focused, closed Selector now selects the matching option — tab to a state picker, press "C", get "CA" — instead of doing nothing until the menu is opened. Repeated presses cycle through options sharing a first letter, and spaces count as match characters ("new y" reaches "New York"). With the menu open, typing moves the highlight and Enter commits, as before. With `hasSearch`, typing on the closed trigger opens the popup and seeds the search input.

Matching reuses the shared `useTypeahead` hook, so Selector behaves like the other collections (menus, listboxes). Because a match committed from the closed trigger changes the value without opening the popup or moving focus, the new selection is announced through `useAnnounce`.

`useCombobox` no longer implements typeahead itself; callers that want it compose `useTypeahead` and run it ahead of the combobox key handler.

Adopting the shared hook exposed two matching bugs in it, fixed here — so `DropdownMenu`, `ContextMenu` and `NavHeadingMenu` improve too. A single-character search now starts _after_ the current item, as native `<select>` and the APG pattern do, instead of only advancing on a repeated press: pressing a letter that the focused item already begins with used to do nothing at all. And with nothing focused the search now genuinely starts at the top, rather than wrapping onto the last item first. Characters composed with Option/Alt (`Option+a` → "å") count as typeahead again, so accented labels stay reachable.

@AKnassa
