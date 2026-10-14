---
'@astryxdesign/core': patch
---

[feat] `DropdownMenu` takes `touchOpen="press"`: a finger opens the popover menu on its press-down, as a mouse press does, instead of on the tap that lifts. The press continues as a drag onto a row, picked on release. Use it for a trigger outside any scrolling region; if the browser takes the press for a scroll before the finger reaches the menu, the menu closes again. The default, `touchOpen="tap"`, is unchanged. `useMenuPress` takes the same `touchOpen` option.

@vjeux
