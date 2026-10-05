---
'@astryxdesign/core': patch
---

[fix] Selector and MultiSelector announce the empty-state message they actually show, and announce it on every path that reaches one.

Two defects, one cause — the live region was fed from the props instead of from what rendered:

- `emptyText` and `emptySearchText` accept a `ReactNode`, but the region spoke the value only when it was a string and announced the built-in default otherwise. A product that put a link or a "create one" row in the dead end showed one message and announced another, so the screen-reader user was told something the sighted user was not reading.
- An empty result that arrived _after_ the keystroke — an async load landing with nothing that matches an active query — was never announced at all. The message sat on screen and the region stayed silent.

Both components now read the rendered message out of the DOM and announce that, from one place that watches the panel's state rather than the keystroke. An element is announced as written, text a child component generates is announced correctly, and anything marked `aria-hidden` is left out of the announcement exactly as it is left out of the screen. A loading panel still announces nothing.

@cixzhang
