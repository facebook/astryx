---
'@astryxdesign/cli': patch
---

[fix] The generated agent cheat sheet hardcoded a shell recommendation ("Full page → AppShell; sidebar nav → SideNav", "pick the shell (AppShell / Layout+LayoutPanel)"), which answers a question that depends on the app archetype and duplicates guidance `astryx docs layout` already maintains. The two layout rules now point agents at that doc — by command and by URL (https://astryx.atmeta.com/docs/layout) — so shell choice, region budgets, and the responsive contract have one source of truth.
@josephfarina
