---
'@astryxdesign/cli': patch
---

[fix] The generated agent cheat sheet hardcoded a shell recommendation ("Full page → AppShell; sidebar nav → SideNav", "pick the shell (AppShell / Layout+LayoutPanel)"), which answers a question that depends on the app archetype and duplicates guidance `astryx docs layout` already maintains. The two layout rules now send agents to that doc instead, so shell choice, region budgets, and the responsive contract have one source of truth.

The rule cites the command rather than the docsite URL, in the block's established `astryx <cmd>` form that the header maps to the project's real invocation (`pnpm exec astryx`, `npx @astryxdesign/cli`, …). `astryx docs` reads the docs shipped inside the installed version, so an agent can't be shown an API that release doesn't have.
@josephfarina
