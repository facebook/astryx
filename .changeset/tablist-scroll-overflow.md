---
'@astryxdesign/core': patch
---

[feat] TabList: a strip narrower than its tabs now scrolls instead of spilling out of its container. Every tab stays a tab — nothing is hidden behind a menu — the edges fade to show there is more, and pointers that can hover get arrow affordances; keyboard and screen-reader users reach every tab with the arrow keys, which scrolls the focused tab into view. The selected tab is scrolled back into view whenever it would be out of sight, including on mount and when the host changes `value` itself. The new `overflow` prop takes `'auto'` (the default, which today always scrolls), `'scroll'`, or `'none'` to keep the old spill-out layout. Built on the existing `useScrollOverflow` hook, so there is no new measurement machinery and no `Carousel` in the tab strip — the documented Carousel recipe, which announced every tab as "slide N of M", is no longer needed and the stories now use the built-in behaviour.

@cixzhang
