---
'@astryxdesign/core': patch
---

[chore] Add `@astryx/no-physical-properties` ESLint rule that flags physical left/right CSS properties inside `stylex.create()` and suggests the CSS logical equivalent for RTL support.

- KEY-BASED: `marginLeft`/`marginRight`, `paddingLeft`/`paddingRight`, `borderLeft`/`borderRight` (+ their `Width`/`Style`/`Color` longhands), `left`/`right` → `insetInlineStart`/`insetInlineEnd`, and the four physical corner radii → their diagonal-aware logical names (`borderTopLeftRadius` → `borderStartStartRadius`, etc.).
- VALUE-BASED: `textAlign: 'left'|'right'`, `float: 'left'|'right'`, and `clear: 'left'|'right'` (the key stays, only the physical value is flagged).
- Scoped strictly to `stylex.create()` — physical identifiers used elsewhere are ignored.

Shipped at `warn` in both the `strict` and `recommended` tiers until the RTL Phase 4 (Calendar/Slider/Table) physical-property migration lands; it will be flipped to `error` afterward.

@nynexman4464
