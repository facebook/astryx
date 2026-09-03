---
'@astryxdesign/core': patch
---

[fix] Keep DropdownMenu and submenu flyouts inside the viewport with safe inline gutters and viewport-aware height limits. Only overflowing menus become internal scroll containers, while `menuWidth` keeps its existing minimum-width behavior up to the available space. (#5395)

[feat] Add an opt-in `presentation` prop for data-driven DropdownMenu instances so products can render the same actions as an anchored popover or a modal bottom sheet according to their own responsive input policy.

@rubyycheung
