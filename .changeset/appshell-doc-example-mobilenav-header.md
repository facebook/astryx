---
'@astryxdesign/core': patch
---

[docs] AppShell: the two worked examples of the `mobileNav` escape hatch passed `title` to `MobileNav`, which does not accept it: `MobileNavProps` omits the native `title` attribute and the drawer heading prop is `header`. Copying either example produced a type error and a drawer with no heading. Both now say `header`. The doc also gains an anatomy list and accessibility guidance covering the landmark structure AppShell owns. (#4944)

@cixzhang
