# CLAUDE.md

Project-specific guidance for AI coding agents.

<!-- XDS:START -->

XDS v0.0.14 — 165 components

Before writing any UI code:

1. `pnpm exec xds template --list` — find a related page pattern
2. `pnpm exec xds template <name> --skeleton` — study layout structure (gap, padding, nesting)
3. `pnpm exec xds component <Name>` — read props + examples for EVERY component you use

Templates are reference code — read them for composition patterns, not just scaffolding.
Full pages → dashboard (uses XDSAppShell). Forms → contact-form. Tables → data-table. Settings → settings-sidebar.

No <div> anywhere — not for layout, not for wrappers, not for spacing. Use components.
Full-page shells → XDSAppShell (not XDSLayout). Sidebar nav → XDSSideNav (not XDSList).
No style={{}} — use the xstyle prop on components for custom styling.
If a component prop does what you need, use it — never replicate with CSS/stylex.
No magic values — run `pnpm exec xds docs tokens` for spacing/color/radius.
To change accent/brand colors: `pnpm exec xds theme` — never override --xds-color-\* in :root.

pnpm exec xds component --list 165 components by category
pnpm exec xds component <Name> props, types, examples
pnpm exec xds docs color Semantic color tokens for surfaces, text, icons...
pnpm exec xds docs elevation Shadow tokens for visual elevation and inset st...
pnpm exec xds docs icons Semantic icon names available in the design sys...
pnpm exec xds docs illustrations Illustration guidelines for empty states, onboa...
pnpm exec xds docs migration How to migrate an existing Tailwind, shadcn, or...
pnpm exec xds docs motion Duration and easing tokens for animations and t...
pnpm exec xds docs principles Core design principles and rules for building w...
pnpm exec xds docs shape Border radius tokens for consistent component r...
pnpm exec xds docs spacing Spacing scale tokens for padding, gap, and marg...
pnpm exec xds docs styling How to customize component appearance: xstyle p...
pnpm exec xds docs theme XDSTheme provider, custom themes, theme build f...
pnpm exec xds docs tokens tokens
pnpm exec xds docs typography Font families, geometric type scale, weight, li...
pnpm exec xds template --list page recipes with component lists
pnpm exec xds template <name> [path] scaffold from template
pnpm exec xds swizzle <Name> eject source (--gap to report why)
pnpm exec xds upgrade --apply codemods after version bump
after @xds/core bump, always run pnpm exec xds upgrade --apply

<!-- XDS:END -->
