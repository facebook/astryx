---
'@astryxdesign/core': patch
---

[docs] Surface literal values for union types in component docs (#1645)

Prop docs named their union types without ever showing the values behind them — `gap: SpacingStep`, `align: GridAlignment`, `sort: TableSortState<TSortKey>`, `status: InputStatus`. Readers without an IDE (agents especially) had to guess, and guessed wrong: `gap={16}` (pixels, not a scale step), `direction: 'desc'` (the type says `'descending'`).

Those props now show their values — `gap: 0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10`, `direction: 'ascending' | 'descending'`, `status: {type: 'warning' | 'error' | 'success', …}` — across 28 doc files, improving both the `astryx component` CLI output and the docsite prop tables. Where spelling a type out would mislead the docsite playground into rendering the wrong control (Lightbox's `media`, AppShell's `mobileNav`), the values are given in the prop description instead.

Four latent doc bugs surfaced along the way: Card was missing its `transparent` variant, Text was missing `type="inherit"`, Field's `status` never named its legal values, and `useTableFiltering`'s `variant` documented only `'popover' | 'inline'` while source has offered `'inline-compact'` all along.

A new guard (`docPropLiterals.test.ts`) derives both the literal-union registry and each component's prop declarations from the TypeScript sources at test time, so a doc that names a union instead of inlining it — or that goes stale when a union gains a member — now fails the suite. It reads hook config bags (`UseTableSortableConfig`) as well as `{Name}Props`, and matches literals on a boundary rather than a substring, so neither `useTableSortable`'s `direction` nor a value masked by a longer sibling (`'sm'` inside `'xsm'`, the spacing step `1` inside `1.5`) can go stale unnoticed.

@AKnassa
