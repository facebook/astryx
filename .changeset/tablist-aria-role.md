---
'@astryxdesign/core': patch
---

[feat] TabList: a strip that switches panels in place can now say so with `role="tablist"`, and it speaks the WAI-ARIA tabs pattern — `role="tablist"` on the strip, `role="tab"` and `aria-selected` on the tabs, and `aria-controls` pointing at the panel each tab opens, from a new `panelId` prop on `Tab`. There is no new prop for the switch: `TabList` declares `role?: AriaRole` and reads it, the way `LayoutHeader`, `LayoutContent` and `LayoutPanel` already declare and document theirs. The keyboard behaviour the pattern asks for was already there: arrows move between tabs, Tab leaves the strip. Under the asserted role the strip takes only the horizontal arrows, leaving ArrowUp and ArrowDown to scroll the page.

`role` already reached the DOM through `{...restProps}`, so a caller could pass `role="tablist"` and get a tablist whose children were still `<button>`s with `aria-current` — invalid markup, no `aria-selected`, and no warning. Reading the role turns that silent breakage into the correct behaviour; declaring it is what puts it in the type, the prop table and the docs.

**Nothing changes for a caller who passes no `role`**: the strip is the `<nav>` landmark with `aria-current` it has always been. Any other role still passes through to the element untouched.

Two development warnings come with the asserted role, and only with it. A tab with an `href` is a false statement inside a tablist, so the `href` is ignored and the warning says so. And a tab that controls nothing gets asked for a `panelId` — either that or an `aria-controls` you wrote yourself satisfies it, and a hand-written one is never overwritten. `aria-controls` is emitted only when you supply the id: pointing at a panel that does not exist is an invalid attribute value, which is worse than saying nothing. A menu or any other non-tab in a tablist strip is invalid markup, and warns too. The mirror case warns as well: a `panelId` on a strip that is not a tablist has no panel relationship to state, and is dropped.

@cixzhang
