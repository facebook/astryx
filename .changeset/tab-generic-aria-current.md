---
'@astryxdesign/core': patch
---

[fix] TabList: the selected tab now carries `aria-current="true"` — ARIA's generic "current item within a set" — instead of `aria-current="page"`. The strip is a `<nav>` and stays one, but it is used to switch views in place at least as often as it is used to navigate, and on those uses `page` asserted a page change that never happened. Assistive tech announced the selected tab as the _current page_ even when nothing had navigated; it now announces it as the _current item_, which is true either way. A tab given an `href` still renders an anchor and still reads as a link — its current marker is just less specific than it was. No role changes and no new props. (#5347)

@cixzhang
