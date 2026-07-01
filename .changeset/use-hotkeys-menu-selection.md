---
'@astryxdesign/core': patch
---

[feat] Add `useHotkeys` hook (global keyboard shortcuts with typing-target guards and mod-key platform mapping) and `isSelected` support on DropdownMenu items (renders `menuitemradio` with aria-checked and a check indicator; also available via MoreMenu/ContextMenu).

Product-scale apps built on the system were all hand-rolling `window.addEventListener('keydown')` shortcut handling with typing-target guards, and reimplementing single-select menus because DropdownMenu items could not show a checked state.

- `useHotkeys(hotkeys)` registers one window keydown listener per hook instance; handlers live in a ref so re-renders never re-subscribe. Combos like `'mod+k'`, `'shift+/'`, `'escape'` — `mod` maps to ⌘ on Apple platforms (same detection as Kbd) and Ctrl elsewhere. Skips typing targets (input/textarea/select/contenteditable) unless `allowInInputs`, skips `defaultPrevented` events, and calls `preventDefault()` on match. SSR-safe.
- `DropdownMenuItemData.isSelected` / `DropdownMenuItem`'s `isSelected` prop: when defined (true OR false) the item renders `role="menuitemradio"` with `aria-checked` and a check indicator when selected; unselected siblings reserve the indicator space so layout stays stable. Undefined keeps today's `role="menuitem"` behavior. MoreMenu and ContextMenu share `DropdownMenuOption`, so they inherit the feature; keyboard navigation and Enter/Space activation in DropdownMenu and ContextMenu now recognize `menuitemradio` items.

@thedjpetersen
