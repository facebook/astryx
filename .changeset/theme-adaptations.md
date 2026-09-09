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

`defineTheme` now validates the token values authored inside an adaptation rule,
rejecting non-string scalars and arrays with a length other than two instead of
emitting them. Root and on-media token input keeps its existing acceptance
unchanged, so themes that pass values through casts or spreads keep building. It
also validates the combined portable and theme-local token graph for every
reachable set of matching
adaptation rules, rejecting cycles before CSS is emitted. Component writes in a
rule use the same target, axis, value-domain, and extension validation as root
`components`; a rule may not be the only place a custom value is enrolled,
because generated type augmentation is unconditional.

`astryx theme build` treats the adaptation generator as a core capability rather
than a baseline requirement, so a theme with no adaptation intent still builds
against an older installed `@astryxdesign/core` and emits the same CSS as before.
A theme that does carry adaptation intent — valid rules, a custom
`widthBreakpoints` map, or present-but-malformed adaptation metadata — fails
against such a core before any output is written, with `ERR_CORE_INCOMPATIBLE`
naming the missing `generateAdaptationCSS` export. A complete default width map
with no rules asks for nothing and still builds. Where an older core's
`defineTheme` drops adaptations while resolving, the build records each raw
`defineTheme()` input and associates it with the theme it produced, so only the
selected theme's lineage decides. An unobservable selected ancestor (including a
CommonJS source package whose ESM core namespace cannot be wrapped) fails closed;
an unused adaptive theme elsewhere in the import graph does not affect a plain
build. The same capture preserves raw typography, color, radius, and motion axis
metadata in old-core-built artifacts, allowing later current-core children to
resolve partial adaptation axes exactly as if they extended the source theme.

@imdreamrunner
