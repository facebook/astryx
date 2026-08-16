---
'@astryxdesign/core': patch
---

[fix] TreeList's `variant` axis is themeable, and a new guard keeps every extensible axis honest. `TreeListVariantMap` invites theme packages to add variants — its own JSDoc shows the module augmentation — but `themeProps('tree-list', {density})` never passed `variant`, so a custom variant type-checked, rendered, and produced no selector to style. It is passed now, and documented in the target's `visualProps` so `astryx theme build` stops calling it an unknown prop.

`packages/core/src/theme/extensibleAxes.test.ts` is the third theming-drift guard, beside the ones covering `targets` and `vars`/`derived`. Those two check what a component renders against what it documents; neither looked at the open prop unions, which is why this went unnoticed. For every `*Map` that types a component prop, it now asserts the three places that have to agree: the interface is declared in the index a consumer augments (a re-export is invisible to both module augmentation and the CLI), the prop is reflected through `themeProps`, and it is documented as a visual prop. It reads the TypeScript AST rather than the type checker, and holds the map's OWNER accountable — a component forwarding `actionVariant` or `statusVariant` to the component that owns the map is not separately responsible for it.

Registry maps that widen a set of NAMES rather than a visual prop (`IndicatorMap`, `IndicatorFamilyMap`) are out of scope by construction, not by allowlist: the guard only considers maps whose alias types a prop on a `*Props` interface.

@cixzhang
