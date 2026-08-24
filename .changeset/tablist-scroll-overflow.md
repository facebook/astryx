---
'@astryxdesign/core': patch
---

[feat] TabList: a strip narrower than its tabs now scrolls instead of spilling out of its container. Every tab stays a tab — nothing is hidden behind a menu — the edges fade to show there is more, and pointers that can hover get arrow affordances; keyboard and screen-reader users reach every tab with the arrow keys, which scrolls the focused tab into view. The selected tab is scrolled back into view whenever it would be out of sight, including on mount and when the host changes `value` itself. The new `overflow` prop takes `'auto'` (the default, which today always scrolls), `'scroll'`, or `'visible'` to keep the old spill-out layout. Built on the existing `useScrollOverflow` hook, so there is no new measurement machinery and no `Carousel` in the tab strip — the documented Carousel recipe, which announced every tab as "slide N of M", is no longer needed and the stories now use the built-in behaviour.

If you followed that recipe, nothing breaks: a `Carousel` still wrapping the tabs renders and behaves exactly as it did before, because its own scroll container absorbs the strip's, which then never overflows. Removing it is worth doing anyway — it drops the `region`/"slide N of M" wrapping from the accessibility tree, and the strip's own scrolling brings a tab that straddles the edge fully into view on focus, which the carousel does not.

@cixzhang
