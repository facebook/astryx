---
'@astryxdesign/core': patch
---

[fix] Keep hover from auto-scrolling open option lists (#6077)

In a scrollable listbox whose highlight follows the pointer, scrolling the highlighted option into view moved the next option under the stationary pointer, whose mouseenter re-highlighted and scrolled again — an endless loop with no user input. This was already fixed for DropdownMenu and Chat; it now covers the remaining combobox-style paths through a shared highlight owner: Selector, MultiSelector, Typeahead, and DateTimeInput hover highlights move only the highlight, while keyboard navigation still scrolls the highlighted option into view.

@liuzhaochen03
