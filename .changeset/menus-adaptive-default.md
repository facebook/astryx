---
'@astryxdesign/core': minor
---

[breaking] Selector, MultiSelector, and data-driven DropdownMenu (and MoreMenu, which forwards to it) now default to `presentation="adaptive"`. On a compact touch screen (768px or narrower with a coarse pointer) the option list or action list opens in a modal bottom sheet; with a mouse, a trackpad, or a larger touch screen it opens in the anchored popover exactly as before. Compound (children) DropdownMenus stay anchored, and an explicit `presentation` always wins.

On compact touch screens the default surface changes from a non-modal listbox or menu to a modal sheet: the trigger reports `aria-haspopup="dialog"`, focus moves into the sheet, and it returns to the trigger on close. To keep the previous behavior for a specific control, pass `presentation="popover"`. No codemod is provided, because rewriting every call site to `popover` would undo the change for everyone who runs `astryx upgrade`.

@thedjpetersen
