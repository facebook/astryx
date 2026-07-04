---
'@astryxdesign/core': patch
---

[feat] Add `useTypeahead` — a first-character (type-to-focus) search hook, and wire it into `DropdownMenu`. Typing a letter jumps to the next menu item whose label starts with it; repeated presses of the same letter cycle through matches; the buffer resets after 750ms; disabled items are skipped. The hook is additive and collection-agnostic (composes with `useListFocus`/`useGridFocus` via `onMatch`), so menus/listboxes gain APG typeahead which astryx previously lacked (menus-11, infra-14) (#3343).
@cixzhang
