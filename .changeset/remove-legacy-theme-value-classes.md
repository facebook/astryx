---
'@astryxdesign/core': minor
---

[breaking] Stop emitting deprecated bare prop and state classes such as `.primary`, `.sm`, and `.checked`. Components retain their stable `astryx-*` target classes and reflect visual props and runtime states through explicit `data-*` attributes; generated runtime and built theme CSS now uses that same selector contract.

Run `astryx upgrade --apply` to migrate safely identifiable selectors in `.css` files when a known Astryx target and v0.5.4 value have one or more known meanings. For example:

- `.astryx-button.primary` → `.astryx-button:is(.primary, [data-variant="primary"])`
- `.astryx-button.sm` → `.astryx-button:is(.sm, [data-size="sm"])`
- `.astryx-switch.checked` → `.astryx-switch:is(.checked, [data-checked="checked"])`

The codemod parses CSS selector syntax and never rewrites declarations, comments, JavaScript/TypeScript strings, unqualified classes, or custom/unknown qualified classes. Each known value becomes a specificity-preserving `:is(...)` union containing the original class arm plus every v0.5.4 reflected data-attribute arm. The class arm keeps consumer-supplied `className` matches working; the attribute arms match v0.6 props and states. You can narrow the union later when class provenance or prop-axis intent is known. Search for unqualified old value selectors such as `.primary` or `.sm` and migrate those manually only where Astryx usage is confirmed. Migrate selectors embedded in JavaScript or TypeScript manually with the same rules.

Semantic `defineTheme({components})` keys such as `variant:primary` and `checked` do not change. If you prebuild a custom theme, rerun `astryx theme build <theme-file>` after upgrading and deploy the regenerated `.css`, `.js`, `.d.ts`, and optional `.variants.d.ts` artifacts together. A built theme is marked `__built: true`, so the runtime intentionally does not regenerate stale CSS.

Exported theme helpers keep their return/container shapes but intentionally return different selector bytes:

- `themeProps` returns the stable target class (plus target-name compatibility aliases), without bare prop/state classes; its reflected `data-*` attributes are unchanged.
- `parseStyleKey` returns data-attribute selector suffixes instead of `.value`, `.prop-N`, or `.state` suffixes.
- `generateThemeRules` keeps its array contract and ordering; non-base component selectors use reflected attributes.
- `generateThemeRulesSplit` keeps `{component, prose}`; `component` selector bytes change and `prose` is unchanged.
- `generateOnMediaCSS` keeps its scoped string contract; component selector bytes change.
- `generateThemeCSS` keeps `{prose, component}` and the same layers/scopes; `component` inherits the new selectors and `prose` is unchanged.

@cixzhang
