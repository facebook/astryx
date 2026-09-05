---
'@astryxdesign/core': minor
'@astryxdesign/cli': minor
---

[breaking] Add ordered environmental adaptations to `defineTheme`

Themes can now opt into CSS-first token, theme-local token, and component
changes for named viewport widths, primary-pointer precision, contrast
preference, and motion preference:

```ts
defineTheme({
  name: 'acme',
  adaptations: {
    widthBreakpoints: {sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536},
    rules: [
      {
        when: {width: {from: 'lg', below: 'xl'}, pointer: 'coarse'},
        value: {tokens: {'--size-element-md': '44px'}},
      },
    ],
  },
});
```

Condition fields are ANDed. `width.from` is inclusive, `width.below` is
exclusive, and rules cascade in declaration order so later matching writes win.
Theme extension preserves the effective breakpoint map and inherited rule order;
static builds retain the metadata needed for source-equivalent extension.

`AppShell` now accepts `xl` and `2xl` for `mobileNav.breakpoint` and resolves all
five names through the nearest Theme. Mobile mode now uses the documented
exclusive boundary (`width < breakpoint`), so an AppShell exactly at the named
point renders the wider layout instead of the mobile layout.

`defineTheme` now rejects malformed token values instead of coercing non-string
scalars or accepting arrays with a length other than two. It also validates the
combined portable and theme-local token graph for every reachable set of matching
adaptation rules, rejecting cycles before CSS is emitted.

@imdreamrunner
