---
'@astryxdesign/core': patch
---

[fix] With `height="fill"`, AppShell's main region can be scrolled from the keyboard when its content overflows and has nothing focusable (WCAG 2.1.1 Keyboard). Before, main was only the skip link's target (`tabIndex={-1}`): Tab passed it by, so long text, a report or a read-only page could not be scrolled without a pointer. Now, while main scrolls overflowing content, it is a stop in the tab order and keyboard focus on it draws the standard focus ring, inset. Tab entry moves on to its first link or button when there is one, so pages with interactive content keep their tab order. A main region that fits, and `height="auto"` (where the page scrolls), are unchanged. `useScrollableArea` also accepts one element as both viewport and content box, and then observes that element's direct children.

@vjeux
